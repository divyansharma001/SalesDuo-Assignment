import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import config from '../config/env';
import * as schema from './schema';

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
});

const db = drizzle(pool, { schema, mode: 'default' });

export { pool };
export default db;
