import { Router } from "express";
import { pool } from "../db.js";
import { stripe } from "../lib/stripe.js";
import { requireAuth } from "../middleware/requireAuth.js";
import process from "node:process";

const router = Router();

// POST /api/checkout  { photoId, quantity? }  -> { url } of Stripe's hosted checkout page
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const photoId = Number(req.body.photoId);
    const quantity = Number(req.body.quantity ?? 1);

    if (!Number.isInteger(photoId)) return res.status(400).json({ error: "Invalid photo" });
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: "Quantity must be between 1 and 10" });
    }

    // 1. Price comes from OUR database, never from the browser.
    const photoResult = await pool.query(
      "SELECT id, title, price_cents FROM photos WHERE id = $1",
      [photoId]
    );
    const photo = photoResult.rows[0];
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
    const total = photo.price_cents * quantity;

    // 2. Save the order as "pending" (order + its item succeed or fail together).
    const db = await pool.connect();
    let orderId;
    try {
      await db.query("BEGIN");
      const orderResult = await db.query(
        "INSERT INTO orders (user_id, total_cents) VALUES ($1, $2) RETURNING id",
        [userId, total]
      );
      orderId = orderResult.rows[0].id;
      await db.query(
        "INSERT INTO order_items (order_id, photo_id, quantity, unit_price_cents) VALUES ($1, $2, $3, $4)",
        [orderId, photo.id, quantity, photo.price_cents]
      );
      await db.query("COMMIT");
    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    } finally {
      db.release();
    }

    // 3. Start the Stripe Checkout Session for this order.
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity,
            price_data: {
              currency: "usd",
              unit_amount: photo.price_cents,
              product_data: { name: `Print: ${photo.title}` },
            },
          },
        ],
        customer_email: userResult.rows[0].email,
        client_reference_id: String(orderId),
        metadata: { order_id: String(orderId) },
        success_url: `${process.env.CLIENT_URL}/?order=${orderId}`,
        cancel_url: `${process.env.CLIENT_URL}/?canceled=1`,
      });

      await pool.query("UPDATE orders SET stripe_session_id = $1 WHERE id = $2", [
        session.id,
        orderId,
      ]);
      res.json({ url: session.url });
    } catch (err) {
      await pool.query("UPDATE orders SET status = 'failed' WHERE id = $1", [orderId]);
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;