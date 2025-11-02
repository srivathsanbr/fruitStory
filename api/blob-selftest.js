// api/blob-selftest.js
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const r = await put(
      'catalog/selftest.txt',
      `ok ${new Date().toISOString()}\n`,
      {
        access: 'public',
        contentType: 'text/plain',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
        allowOverwrite: true
      }
    );
    res.status(200).json({ ok: true, url: r.url });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e?.message || String(e),
      hint: 'Token must be Read & Write and belong to the SAME team/project'
    });
  }
}
