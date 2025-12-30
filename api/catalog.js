// Vercel Serverless Function (optional):
// If deployed on Vercel, you can use /api/catalog to serve the catalog JSON.
// This is NOT required for local static preview since we also ship /catalog/catalog.json.

import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const p = path.join(process.cwd(), "catalog", "catalog.json");
    const raw = fs.readFileSync(p, "utf-8");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(raw);
  } catch (e) {
    res.status(500).json({ error: "Unable to read catalog.json" });
  }
}
