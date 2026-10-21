import { readFile } from "node:fs/promises";
import { pool } from "./db.js";
import { photos } from "./seedData.js";
import process from "node:process";

async function seed() {
  // 1. Create the tables if they don't exist yet.
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  await pool.query(schema);

  // 2. Clear old photos so running the seed twice doesn't duplicate rows.
  await pool.query("TRUNCATE photos RESTART IDENTITY");

  // 3. Insert each photo (values are passed separately: safe from SQL injection).
  for (const p of photos) {
    await pool.query(
      "INSERT INTO photos (title, category, layout, src, alt) VALUES ($1, $2, $3, $4, $5)",
      [p.title, p.category, p.layout, p.src, p.alt]
    );
  }

  console.log(`Seeded ${photos.length} photos.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});