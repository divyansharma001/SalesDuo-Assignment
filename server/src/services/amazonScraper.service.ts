import axios from 'axios';
import * as cheerio from 'cheerio';
import { ApiError } from '../utils/ApiError';
import { SCRAPER_HEADERS, AMAZON_DOMAINS, DEFAULT_MARKETPLACE } from '../utils/constants';
import logger from '../utils/logger';

interface ScrapedData {
  title: string;
  bullet_points: string[];
  description: string;
  price: string;
  image_url: string;
}

export const scrapeAmazonProduct = async (asin: string, marketplace: string = DEFAULT_MARKETPLACE): Promise<ScrapedData> => {
  const baseUrl = AMAZON_DOMAINS[marketplace] || AMAZON_DOMAINS[DEFAULT_MARKETPLACE];
  const url = `${baseUrl}/dp/${asin}`;
  logger.info(`Starting scrape for ASIN: ${asin}`, { url });

  try {
    const response = await axios.get(url, {
      headers: SCRAPER_HEADERS,
      timeout: 10000, // 10s timeout
      validateStatus: (status) => status < 500 // Handle 404s manually
    });

    logger.info(`Received response status ${response.status} for ASIN: ${asin}`);

    if (response.status === 404) {
      throw new ApiError(404, `Product with ASIN ${asin} not found on ${marketplace}. Please verify: 1) The ASIN exists on ${marketplace}, 2) The product page is active and not removed.`);
    }

    const $ = cheerio.load(response.data);

    // Check for CAPTCHA
    if ($('title').text().includes('Robot Check') || $('form[action*="validateCaptcha"]').length > 0) {
        logger.warn(`CAPTCHA detected for ASIN: ${asin}`);
        throw new ApiError(503, 'Amazon scraping blocked by CAPTCHA. Please try again later.');
    }

    // Check for "Page Not Found" indicators
    const pageTitle = $('title').text();
    const bodyText = $('body').text();
    if (pageTitle.includes('Page Not Found') || bodyText.includes('Looking for something') || $('#noResultsTitle').length > 0) {
        logger.warn(`Product page not found for ASIN: ${asin}. Page title: ${pageTitle}`);
        throw new ApiError(404, `Product with ASIN ${asin} not found on ${marketplace}. The product may have been removed or the ASIN may be incorrect.`);
    }

    // 1. Title
    const title = $('#productTitle').text().trim();
    if (!title) {
        logger.error(`Failed to extract title for ASIN: ${asin}. Page might not be a valid product page.`);
        logger.debug(`Page title: ${$('title').text()}`);
        throw new ApiError(422, `Unable to extract product data for ASIN ${asin}. This may not be a valid product page on ${marketplace}.`);
    }

    // 2. Bullet Points (with fallback selectors and noise filtering)
    const bullet_points: string[] = [];
    const bulletSelectors = [
      '#feature-bullets ul li span.a-list-item',
      '#feature-bullets .a-list-item',
      '#featurebullets_feature_div li span.a-list-item',
      'ul.a-unordered-list.a-vertical li span.a-list-item',
    ];

    for (const selector of bulletSelectors) {
      $(selector).each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        // Filter out noise: too short, too long, or known Amazon UI patterns
        if (
          text &&
          text.length > 15 &&
          text.length < 1000 &&
          !text.toLowerCase().includes('consider a similar item') &&
          !text.toLowerCase().includes('enhance your purchase') &&
          !text.toLowerCase().includes('see more product details') &&
          !text.startsWith('›')
        ) {
          bullet_points.push(text);
        }
      });
      if (bullet_points.length > 0) break; // Use first successful selector
    }

    logger.info(`Extracted ${bullet_points.length} bullet points for ASIN: ${asin}`);

    // 3. Description (Multiple possible selectors)
    let description = '';
    
    // Try #productDescription first (cleanest source)
    const prodDesc = $('#productDescription').clone();
    prodDesc.find('style, script, noscript, link').remove();
    const prodDescText = prodDesc.text().trim().replace(/\s+/g, ' ');
    
    if (prodDescText && prodDescText.length > 20) {
        description = prodDescText;
    } else {
        // Fallback: extract only meaningful text from A+ content
        const aplusEl = $('#aplus, .aplus-v2').first().clone();
        // Remove all non-content elements
        aplusEl.find('style, script, noscript, link, iframe, svg, img, input, select, button, nav, header, footer').remove();
        // Remove elements that typically contain CSS class definitions or JS
        aplusEl.find('[class*="premium-aplus"], [class*="container-with-background"]').each((_, el) => {
            const innerText = $(el).text().trim();
            // If the element text looks like CSS/JS (contains { } or function), remove it
            if (innerText.includes('{') && innerText.includes('}')) {
                $(el).remove();
            }
        });
        let aplusText = aplusEl.text().trim().replace(/\s+/g, ' ');
        // Strip any remaining CSS-like content: anything between { }
        aplusText = aplusText.replace(/\{[^}]*\}/g, '').replace(/\s+/g, ' ').trim();
        // Strip common CSS/JS noise patterns
        aplusText = aplusText
            .replace(/\.\w[\w.-]*\s*\{[^}]*\}/g, '')
            .replace(/function\s+\w+\([^)]*\)\s*\{[^}]*\}/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        // Only use if we got meaningful content (not just CSS residue)
        if (aplusText.length > 50 && !aplusText.startsWith('.aplus')) {
            description = aplusText;
        }
    }

    // 4. Price (Tricky, many formats)
    let price = '';
    const priceSelectors = [
        '.a-price .a-offscreen',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-color-price'
    ];
    
    for (const selector of priceSelectors) {
        const p = $(selector).first().text().trim();
        if (p) {
            price = p;
            break;
        }
    }

    // 5. Image (High Res)
    let image_url = '';
    // Amazon stores dynamic images in data-a-dynamic-image attribute (JSON)
    const dynamicImageContainer = $('#landingImage, #imgBlkFront');
    const dynamicData = dynamicImageContainer.attr('data-a-dynamic-image');
    
    if (dynamicData) {
        try {
            const images = JSON.parse(dynamicData);
            // Get the largest image (keys are URLs)
            image_url = Object.keys(images)[0]; 
        } catch (e) {
            // Fallback
            image_url = dynamicImageContainer.attr('src') || '';
        }
    } else {
        image_url = dynamicImageContainer.attr('src') || '';
    }

    const result = {
        title,
        bullet_points,
        description: description.substring(0, 5000), // Limit length for DB safety
        price,
        image_url
    };

    logger.info(`Successfully scraped ASIN: ${asin}`);
    return result;

  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    
    logger.error(`Scraping failed for ASIN ${asin}:`, error.message);
    throw new ApiError(500, `Failed to scrape Amazon product: ${error.message}`);
  }
};