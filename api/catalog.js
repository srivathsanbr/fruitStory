// api/catalog.js
import { put, head } from '@vercel/blob';

const FILE_PATH = 'catalog/catalog.json';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'Missing BLOB_READ_WRITE_TOKEN env var.' });
  }

  if (req.method === 'GET') {
    try {
      const h = await head(FILE_PATH, { token: process.env.BLOB_READ_WRITE_TOKEN });
      if (h?.url) {
        const r = await fetch(h.url, { cache: 'no-store' });
        if (!r.ok) return res.status(502).json({ error: `Blob fetch error ${r.status}` });
        const json = await r.json();
        return res.status(200).json(json);
      }
      return res.status(200).json([]); // first-time: empty list
    } catch {
      return res.status(200).json([]); // safe fallback
    }
  }

  if (req.method === 'PUT') {
    const key = req.headers['x-admin-key'];
    if (!process.env.ADMIN_SECRET) {
      return res.status(500).json({ error: 'Missing ADMIN_SECRET env var.' });
    }
    if (key !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized: ADMIN_SECRET mismatch.' });
    }

    let payload;
    try {
      payload = await parseJSON(req);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    if (!Array.isArray(payload)) {
      return res.status(400).json({ error: 'Payload must be an array of items.' });
    }
    const ok = payload.every(x => x && typeof x === 'object' && x.id && x.name);
    if (!ok) {
      return res.status(400).json({ error: 'Each item must include at least { id, name }' });
    }

    try {
      const result = await put(
        FILE_PATH,
        JSON.stringify(payload, null, 2),
        {
          access: 'public',
          contentType: 'application/json',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: false,
          allowOverwrite: true   // <--- key fix
        }
      );
      return res.status(200).json({ ok: true, url: result.url });
    } catch (e) {
      const msg = e?.message || String(e);
      return res.status(500).json({
        error: `Blob put failed: ${msg}.`
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function parseJSON(req) {
  const text = await streamToString(req);
  return JSON.parse(text || '[]');
}

function streamToString(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
