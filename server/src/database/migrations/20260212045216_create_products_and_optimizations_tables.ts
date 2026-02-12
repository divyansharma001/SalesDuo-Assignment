import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable('products', (table) => {
            table.increments('id').primary();
            table.string('asin', 10).notNullable().index();
            table.text('title').notNullable();
            table.json('bullet_points').notNullable();
            table.text('description');
            table.string('price', 50);
            table.string('image_url', 2048);
            table.timestamp('fetched_at').defaultTo(knex.fn.now());
            table.timestamps(true, true); 
        })
        .createTable('optimizations', (table) => {
            table.increments('id').primary();
            table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
            table.string('asin', 10).notNullable().index(); 
            table.text('optimized_title');
            table.json('optimized_bullets');
            table.text('optimized_description');
            table.json('keywords');
            table.string('model_used', 50);
            table.integer('prompt_tokens');
            table.integer('completion_tokens');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTableIfExists('optimizations')
        .dropTableIfExists('products');
}