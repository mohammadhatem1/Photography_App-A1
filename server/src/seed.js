import { readFile } from "node:fs/promises";
import { pool } from "./db.js";
import { photos } from "./seedData.js";
import process from "node:process";

async function seed() {
  // 1. Create or update the tables.
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  await pool.query(schema);

  // 2. Insert each photo, or update it if it already exists.
  //    (No TRUNCATE any more: orders and favorites point at photos.)
  for (const p of photos) {
    await pool.query(
      `INSERT INTO photos (id, title, category, layout, src, alt, price_cents)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         category = EXCLUDED.category,
         layout = EXCLUDED.layout,
         src = EXCLUDED.src,
         alt = EXCLUDED.alt,
         price_cents = EXCLUDED.price_cents`,
      [p.id, p.title, p.category, p.layout, p.src, p.alt, p.price_cents]
    );
  }

  // 3. Keep the id counter ahead of the ids we inserted by hand.
  await pool.query(
    "SELECT setval(pg_get_serial_sequence('photos', 'id'), (SELECT MAX(id) FROM photos))"
  );

  console.log(`Seeded ${photos.length} photos.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});