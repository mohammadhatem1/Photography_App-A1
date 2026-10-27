// Blocks the request unless the visitor has a signed-in session.
export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please sign in first" });
  }
  next();
}