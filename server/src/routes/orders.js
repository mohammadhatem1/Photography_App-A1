import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// GET /api/orders/:id -> one of the signed-in user's own orders, with its items
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid order id" });

    const orderResult = await pool.query(
      "SELECT id, status, total_cents, created_at, paid_at FROM orders WHERE id = $1 AND user_id = $2",
      [id, req.session.userId]
    );
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: "Order not found" });

    const itemsResult = await pool.query(
      `SELECT p.title, oi.quantity, oi.unit_price_cents
       FROM order_items oi
       JOIN photos p ON p.id = oi.photo_id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [id]
    );

    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    next(err);
  }
});

export default router;