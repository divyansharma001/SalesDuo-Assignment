import { GoogleGenAI } from '@google/genai';
import config from '../config/env';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

export interface OptimizationResult {
  optimizedTitle: string;
  optimizedBullets: string[];
  optimizedDescription: string;
  keywords: string[];
  modelUsed: string;
  promptTokens: number | null;
  completionTokens: number | null;
}

interface ProductInput {
  asin: string;
  title: string;
  bulletPoints: string[];
  description: string;
}

function buildPrompt(product: ProductInput): string {
  return `You are an expert Amazon listing optimization specialist with deep knowledge of the Amazon A9/A10 search algorithm, consumer psychology, and high-converting copywriting.

TASK: Optimize the following Amazon product listing to maximize search visibility, click-through rate, and conversion rate while remaining compliant with Amazon's listing guidelines.

CURRENT LISTING:
- ASIN: ${product.asin}
- Title: ${product.title}
- Bullet Points:
${product.bulletPoints.length > 0 ? product.bulletPoints.map((bp, i) => `  ${i + 1}. ${bp}`).join('\n') : '  (No bullet points available)'}
- Description: ${product.description || '(No description available)'}

OPTIMIZATION RULES:
1. TITLE: Keep under 200 characters. Front-load the primary keyword. Include brand name (if identifiable), key features, product type, secondary features, and size/quantity where applicable. Follow the pattern: [Brand] [Key Feature] [Product Type] [Secondary Features] [Size/Count]. Make it readable — avoid keyword stuffing.

2. BULLET POINTS: Provide exactly 5 bullets. Each bullet must start with a CAPITALIZED benefit phrase (2-4 words) followed by a colon or dash. Focus on benefits first, then supporting features. Include relevant keywords naturally. Each bullet should be 100-200 characters. Cover: primary benefit, key feature, quality/material, use case, and guarantee/trust signal.

3. DESCRIPTION: Write 800-1500 characters of persuasive, benefit-driven copy. Use short paragraphs. Open with a compelling hook. Include specific details (dimensions, materials, use cases). End with a clear call to action. Naturally weave in relevant keywords without stuffing. Do NOT use HTML tags.

4. KEYWORDS: Provide exactly 5 high-value backend search terms that are NOT already used in the title or bullet points. Focus on synonyms, related search terms, long-tail phrases, and common misspellings. Each keyword should be a phrase (2-4 words), not a single word.

Respond ONLY with valid JSON matching the exact structure specified.`;
}

export async function optimizeWithGemini(product: ProductInput): Promise<OptimizationResult> {
  const prompt = buildPrompt(product);

  try {
    const response = await ai.models.generateContent({
      model: config.gemini.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            optimizedTitle: { type: 'STRING' },
            optimizedBullets: {
              type: 'ARRAY',
              items: { type: 'STRING' },
            },
            optimizedDescription: { type: 'STRING' },
            keywords: {
              type: 'ARRAY',
              items: { type: 'STRING' },
            },
          },
          required: [
            'optimizedTitle',
            'optimizedBullets',
            'optimizedDescription',
            'keywords',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(text);

    if (
      !parsed.optimizedTitle ||
      !Array.isArray(parsed.optimizedBullets) ||
      parsed.optimizedBullets.length === 0 ||
      !parsed.optimizedDescription ||
      !Array.isArray(parsed.keywords) ||
      parsed.keywords.length === 0
    ) {
      throw new Error('Invalid response structure from Gemini');
    }

    return {
      optimizedTitle: parsed.optimizedTitle,
      optimizedBullets: parsed.optimizedBullets,
      optimizedDescription: parsed.optimizedDescription,
      keywords: parsed.keywords,
      modelUsed: config.gemini.model,
      promptTokens: response.usageMetadata?.promptTokenCount ?? null,
      completionTokens: response.usageMetadata?.candidatesTokenCount ?? null,
    };
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    logger.error(`Gemini API error: ${err.message}`);
    throw new ApiError(503, 'AI optimization service is temporarily unavailable. Please try again.');
  }
}
