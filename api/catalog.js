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

  if (req.method === 'GET') {
    try {
      const h = await head(FILE_PATH, { token: process.env.BLOB_READ_WRITE_TOKEN });
      if (!h?.url) return res.status(200).json([]);
      const r = await fetch(h.url, { cache: 'no-store' });
      const json = await r.json();
      return res.status(200).json(json);
    } catch (e) {
      return res.status(200).json([]);
    }
  }

  if (req.method === 'PUT') {
    const key = req.headers['x-admin-key'];
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let payload;
    try {
      payload = await parseJSON(req);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    if (!Array.isArray(payload)) {
      return res.status(400).json({ error: 'Payload must be an array' });
    }
    const ok = payload.every(x => x && typeof x === 'object' && x.id && x.name);
    if (!ok) {
      return res.status(400).json({ error: 'Each item must include at least { id, name }' });
    }

    const result = await put(FILE_PATH, JSON.stringify(payload, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false
    });

    return res.status(200).json({ ok: true, url: result.url });
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
