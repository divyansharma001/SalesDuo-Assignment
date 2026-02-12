import { eq, desc, gt, and } from 'drizzle-orm';
import db from '../database/db';
import { products } from '../database/schema';

export interface ProductInput {
  asin: string;
  title: string;
  bullet_points: string[];
  description: string;
  price?: string;
  image_url?: string;
}

export type Product = typeof products.$inferSelect;

export const ProductModel = {
  async create(product: ProductInput): Promise<number> {
    const [result] = await db.insert(products).values({
      asin: product.asin,
      title: product.title,
      bulletPoints: product.bullet_points,
      description: product.description,
      price: product.price,
      imageUrl: product.image_url,
      fetchedAt: new Date(),
    }).$returningId();
    return result.id;
  },

  async findByAsin(asin: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.asin, asin))
      .orderBy(desc(products.fetchedAt))
      .limit(1);
    return product;
  },

  async findLatestValidByAsin(asin: string, ttl: number): Promise<Product | undefined> {
    const cutoff = new Date(Date.now() - ttl);
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.asin, asin), gt(products.fetchedAt, cutoff)))
      .orderBy(desc(products.fetchedAt))
      .limit(1);
    return product;
  },

  async findById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return product;
  },
};
