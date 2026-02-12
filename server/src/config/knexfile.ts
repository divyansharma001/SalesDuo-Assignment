import type { Knex } from "knex";
import config from "./env";

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : undefined,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/database/migrations",
      extension: "ts", 
    },
  },
};

export default knexConfig;
