import pg from "pg";
import process from "node:process";

// One shared pool of connections to Postgres (Neon).
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});