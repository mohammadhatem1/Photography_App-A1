import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";
import photosRouter from "./routes/photos.js";
import authRouter from "./routes/auth.js";
import favoritesRouter from "./routes/favorites.js";
import checkoutRouter from "./routes/checkout.js";
import ordersRouter from "./routes/orders.js";
import webhookRouter from "./routes/webhook.js";
import process from "node:process";

const required = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CLIENT_URL",
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3001;

// Railway/Render/Vercel sit in front of the app; trust them so secure cookies work.
app.set("trust proxy", 1);

// The webhook must come BEFORE express.json() because it needs the raw request body.
app.use("/api/stripe/webhook", webhookRouter);

app.use(express.json());

// Sessions are stored in Postgres, so they survive refreshes and server restarts.
const PgStore = connectPgSimple(session);
app.use(
  session({
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

app.get("/", (req, res) => res.json({ message: "Portfolio API is running. Try /api/photos" }));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/photos", photosRouter);
app.use("/api/auth", authRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", ordersRouter);

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, _next) => {
  void _next;
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));