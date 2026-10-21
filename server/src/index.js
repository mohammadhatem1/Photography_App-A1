import express from "express";
import photosRouter from "./routes/photos.js";
import process from "node:process";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/photos", photosRouter);

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));