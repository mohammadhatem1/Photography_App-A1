import express, { Router } from "express";
import { pool } from "../db.js";
import { stripe } from "../lib/stripe.js";
import process from "node:process";

const router = Router();

// Stripe calls this URL. It needs the RAW body (not parsed JSON) so the
// signature can be verified, which is why this router is mounted before express.json().
router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature check failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        // The ONLY place an order becomes "paid". The extra conditions make sure
        // the session and the amount match the order we created.
        await pool.query(
          `UPDATE orders SET status = 'paid', paid_at = now()
           WHERE id = $1 AND stripe_session_id = $2 AND total_cents = $3 AND status = 'pending'`,
          [Number(session.metadata.order_id), session.id, session.amount_total]
        );
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      await pool.query(
        "UPDATE orders SET status = 'expired' WHERE id = $1 AND stripe_session_id = $2 AND status = 'pending'",
        [Number(session.metadata.order_id), session.id]
      );
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler failed:", err);
    res.status(500).send("Webhook handler failed"); // Stripe will retry
  }
});

export default router;