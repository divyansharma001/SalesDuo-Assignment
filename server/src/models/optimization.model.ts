import { eq, desc, count, sql } from 'drizzle-orm';
import db from '../database/db';
import { optimizations, products } from '../database/schema';

export interface OptimizationInput {
  productId: number;
  asin: string;
  optimizedTitle: string;
  optimizedBullets: string[];
  optimizedDescription: string;
  keywords: string[];
  modelUsed: string;
  promptTokens?: number | null;
  completionTokens?: number | null;
}

export type Optimization = typeof optimizations.$inferSelect;

export const OptimizationModel = {
  async create(data: OptimizationInput): Promise<number> {
    const [result] = await db.insert(optimizations).values({
      productId: data.productId,
      asin: data.asin,
      optimizedTitle: data.optimizedTitle,
      optimizedBullets: data.optimizedBullets,
      optimizedDescription: data.optimizedDescription,
      keywords: data.keywords,
      modelUsed: data.modelUsed,
      promptTokens: data.promptTokens ?? null,
      completionTokens: data.completionTokens ?? null,
    }).$returningId();
    return result.id;
  },

  async findByAsin(asin: string, { limit = 20, offset = 0 } = {}): Promise<Optimization[]> {
    return db
      .select()
      .from(optimizations)
      .where(eq(optimizations.asin, asin))
      .orderBy(desc(optimizations.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async findByIdWithProduct(id: number) {
    const [row] = await db
      .select({
        id: optimizations.id,
        productId: optimizations.productId,
        asin: optimizations.asin,
        optimizedTitle: optimizations.optimizedTitle,
        optimizedBullets: optimizations.optimizedBullets,
        optimizedDescription: optimizations.optimizedDescription,
        keywords: optimizations.keywords,
        modelUsed: optimizations.modelUsed,
        promptTokens: optimizations.promptTokens,
        completionTokens: optimizations.completionTokens,
        createdAt: optimizations.createdAt,
        originalTitle: products.title,
        originalBullets: products.bulletPoints,
        originalDescription: products.description,
        originalPrice: products.price,
        originalImageUrl: products.imageUrl,
      })
      .from(optimizations)
      .innerJoin(products, eq(optimizations.productId, products.id))
      .where(eq(optimizations.id, id))
      .limit(1);
    return row;
  },

  async findRecent(limit = 10) {
    const subquery = db
      .select({
        maxId: sql<number>`MAX(${optimizations.id})`.as('max_id'),
      })
      .from(optimizations)
      .groupBy(optimizations.asin)
      .as('latest');

    return db
      .select({
        id: optimizations.id,
        asin: optimizations.asin,
        optimizedTitle: optimizations.optimizedTitle,
        modelUsed: optimizations.modelUsed,
        createdAt: optimizations.createdAt,
        originalTitle: products.title,
        originalImageUrl: products.imageUrl,
      })
      .from(optimizations)
      .innerJoin(subquery, eq(optimizations.id, subquery.maxId))
      .innerJoin(products, eq(optimizations.productId, products.id))
      .orderBy(desc(optimizations.createdAt))
      .limit(limit);
  },

  async countByAsin(asin: string): Promise<number> {
    const [result] = await db
      .select({ total: count() })
      .from(optimizations)
      .where(eq(optimizations.asin, asin));
    return result.total;
  },

  async deleteByAsin(asin: string): Promise<number> {
    const result = await db
      .delete(optimizations)
      .where(eq(optimizations.asin, asin));
    return result[0].affectedRows ?? 0;
  },
};
