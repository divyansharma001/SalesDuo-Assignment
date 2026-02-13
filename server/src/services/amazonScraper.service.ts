import axios from 'axios';
import * as cheerio from 'cheerio';
import { ApiError } from '../utils/ApiError';
import { SCRAPER_HEADERS, AMAZON_BASE_URL } from '../utils/constants';
import logger from '../utils/logger';

interface ScrapedData {
  title: string;
  bullet_points: string[];
  description: string;
  price: string;
  image_url: string;
}

export const scrapeAmazonProduct = async (asin: string): Promise<ScrapedData> => {
  const url = `${AMAZON_BASE_URL}/dp/${asin}`;
  logger.info(`Starting scrape for ASIN: ${asin}`, { url });

  try {
    const response = await axios.get(url, {
      headers: SCRAPER_HEADERS,
      timeout: 10000, // 10s timeout
      validateStatus: (status) => status < 500 // Handle 404s manually
    });

    logger.info(`Received response status ${response.status} for ASIN: ${asin}`);

    if (response.status === 404) {
      throw new ApiError(404, `Product with ASIN ${asin} not found on Amazon.com. Please verify: 1) The ASIN exists on amazon.com (not other Amazon domains), 2) The product page is active and not removed.`);
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
        throw new ApiError(404, `Product with ASIN ${asin} not found on Amazon.com. The product may have been removed or the ASIN may be incorrect.`);
    }

    // 1. Title
    const title = $('#productTitle').text().trim();
    if (!title) {
        logger.error(`Failed to extract title for ASIN: ${asin}. Page might not be a valid product page.`);
        logger.debug(`Page title: ${$('title').text()}`);
        throw new ApiError(422, `Unable to extract product data for ASIN ${asin}. This may not be a valid product page on Amazon.com.`);
    }

    // 2. Bullet Points
    const bullet_points: string[] = [];
    $('#feature-bullets ul li span.a-list-item').each((_, el) => {
      const text = $(el).text().trim();
      if (text) bullet_points.push(text);
    });

    // 3. Description (Multiple possible selectors)
    let description = '';
    const descSelectors = [
        '#productDescription', 
        '#aplus', // A+ content often replaces standard description
        '.aplus-v2' 
    ];
    
    for (const selector of descSelectors) {
        const text = $(selector).text().trim().replace(/\s+/g, ' ');
        if (text) {
            description = text;
            break;
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