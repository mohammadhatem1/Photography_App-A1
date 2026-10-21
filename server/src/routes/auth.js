import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const router = Router();

// Start a fresh session for this user (new session id prevents session fixation).
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = user.id;
      req.session.save((err2) => (err2 ? reject(err2) : resolve()));
    });
  });
}

// POST /api/auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash]
    );

    await startSession(req, rows[0]);
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "That email is already registered" });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    const { rows } = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    await startSession(req, user);
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me -> who is signed in (null if nobody). Used on page refresh.
router.get("/me", async (req, res, next) => {
  try {
    if (!req.session.userId) return res.json({ user: null });
    const { rows } = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [
      req.session.userId,
    ]);
    res.json({ user: rows[0] ?? null });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

export default router;