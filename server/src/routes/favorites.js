import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth); // every favorites route needs a signed-in user

// GET /api/favorites -> array of photo ids the user favorited
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT photo_id FROM favorites WHERE user_id = $1 ORDER BY created_at",
      [req.session.userId]
    );
    res.json(rows.map((row) => row.photo_id));
  } catch (err) {
    next(err);
  }
});

// PUT /api/favorites/:photoId -> add a favorite (safe to repeat)
router.put("/:photoId", async (req, res, next) => {
  try {
    const photoId = Number(req.params.photoId);
    if (!Number.isInteger(photoId)) return res.status(400).json({ error: "Invalid photo id" });

    await pool.query(
      "INSERT INTO favorites (user_id, photo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.session.userId, photoId]
    );
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "23503") return res.status(404).json({ error: "Photo not found" });
    next(err);
  }
});

// DELETE /api/favorites/:photoId -> remove a favorite
router.delete("/:photoId", async (req, res, next) => {
  try {
    const photoId = Number(req.params.photoId);
    if (!Number.isInteger(photoId)) return res.status(400).json({ error: "Invalid photo id" });

    await pool.query("DELETE FROM favorites WHERE user_id = $1 AND photo_id = $2", [
      req.session.userId,
      photoId,
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;