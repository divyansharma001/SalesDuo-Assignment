import {
  mysqlTable,
  int,
  varchar,
  text,
  json,
  timestamp,
} from 'drizzle-orm/mysql-core';

export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  asin: varchar('asin', { length: 10 }).notNull(),
  title: text('title').notNull(),
  bulletPoints: json('bullet_points').notNull().$type<string[]>(),
  description: text('description'),
  price: varchar('price', { length: 50 }),
  imageUrl: varchar('image_url', { length: 2048 }),
  fetchedAt: timestamp('fetched_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const optimizations = mysqlTable('optimizations', {
  id: int('id').primaryKey().autoincrement(),
  productId: int('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  asin: varchar('asin', { length: 10 }).notNull(),
  optimizedTitle: text('optimized_title'),
  optimizedBullets: json('optimized_bullets').$type<string[]>(),
  optimizedDescription: text('optimized_description'),
  keywords: json('keywords').$type<string[]>(),
  modelUsed: varchar('model_used', { length: 50 }),
  promptTokens: int('prompt_tokens'),
  completionTokens: int('completion_tokens'),
  createdAt: timestamp('created_at').defaultNow(),
});
