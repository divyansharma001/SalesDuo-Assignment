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
  return `You are a senior Amazon Marketplace listing strategist who has optimized 10,000+ ASINs across every category. You combine deep expertise in:
- Amazon A9/A10 search ranking algorithm and indexing behavior
- Consumer psychology, persuasion principles, and high-converting copywriting
- Amazon Terms of Service and listing policy compliance (Seller Central style guide)
- Competitive differentiation and brand positioning on Amazon

TASK: Rewrite and optimize the following Amazon product listing. Your goal is to maximize organic search ranking (impressions), click-through rate, and conversion rate — while staying fully compliant with Amazon's content policies (no superlatives like "best" or "#1", no time-sensitive claims, no competitor references, no medical/health guarantees).

═══ CURRENT LISTING ═══
ASIN: ${product.asin}
Title: ${product.title}
Bullet Points:
${product.bulletPoints.length > 0 ? product.bulletPoints.map((bp, i) => `  ${i + 1}. ${bp}`).join('\n') : '  (none provided — infer likely benefits from the title and description)'}
Description: ${product.description || '(none provided — infer product details from the title and bullets)'}

═══ OPTIMIZATION INSTRUCTIONS ═══

1. IMPROVED TITLE (keyword-rich and readable)
   - Maximum 200 characters. Front-load the highest-volume primary keyword within the first 80 characters (this portion appears in mobile search results).
   - Follow the formula: [Brand] + [Primary Keyword / Product Type] + [Key Differentiating Feature] + [Secondary Feature] + [Size / Quantity / Variant] (omit any element you cannot confidently infer).
   - Integrate 2-3 secondary keywords naturally — the title must read like fluent English, not a keyword dump.
   - Capitalize the first letter of each major word (Title Case). Do NOT use ALL CAPS, special characters (★, ✓, etc.), or promotional phrases ("Sale", "Free Shipping").
   - If the original title already contains a recognizable brand name, keep it at the start.

2. REWRITTEN BULLET POINTS (clear and concise)
   - Return exactly 5 bullets, each between 150-250 characters.
   - Structure each bullet as: **CAPITALIZED BENEFIT PHRASE (2-5 words):** followed by a supporting explanation that blends a feature with its real-world benefit to the buyer.
   - Bullet order:
     ① Primary benefit / unique selling proposition
     ② Key feature or technology differentiator
     ③ Quality, material, or build detail
     ④ Ideal use case, audience, or occasion
     ⑤ Trust signal — warranty, what's included, or satisfaction promise
   - Naturally embed 1-2 relevant keywords per bullet without forcing them.
   - Write for scanners: lead with the outcome the customer cares about, then explain how the product delivers it.
   - Avoid vague filler ("great product", "high quality"). Be specific — mention numbers, materials, dimensions, or comparisons to generic alternatives where possible.
   - Do NOT use HTML, emojis, or special symbols.

3. ENHANCED DESCRIPTION (persuasive but compliant)
   - Write 800-1500 characters of compelling, benefit-forward copy.
   - Structure: Hook sentence (address a pain point or aspiration) → 2-3 short paragraphs expanding on key benefits with sensory and specific details (dimensions, materials, weight, use cases) → Closing call to action ("Add to cart", "Click Buy Now", etc.).
   - Tone: confident and trustworthy — like a knowledgeable friend recommending the product. Avoid hype, exaggeration, or unverifiable claims.
   - Weave in 3-5 relevant long-tail keywords naturally throughout; never repeat the exact same keyword phrase more than once.
   - Do NOT use HTML tags, markdown, emojis, or special formatting characters. Plain text only.
   - Ensure compliance: no health/medical claims, no "guaranteed" results, no competitor mentions, no time-limited language.

4. KEYWORD SUGGESTIONS (3-5 new backend search terms)
   - Provide exactly 5 high-value keyword phrases that are NOT already present in the optimized title, bullets, or description.
   - Each keyword should be 2-4 words — focus on:
     • Synonyms and alternate names for the product ("tumbler" ↔ "insulated cup")
     • Long-tail buyer-intent phrases ("gift for dad", "office desk accessories")
     • Common misspellings or alternate spellings shoppers actually type
     • Related use-case or occasion terms ("camping gear", "back to school")
     • Spanish or other language terms if the product category has significant bilingual search volume
   - Do NOT include brand names, ASINs, or single generic words.

Respond with valid JSON only. No commentary outside the JSON object.`;
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
