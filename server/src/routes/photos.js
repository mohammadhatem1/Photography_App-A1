import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/photos -> all gallery items as JSON (including print price)
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, category, layout, src, alt, price_cents FROM photos ORDER BY id"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;