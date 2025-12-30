# Fruit Story — MEDIGRADE™ Website (Complete Static Project)

This is a complete, ready-to-deploy static website themed around **MEDIGRADE™**.

## Pages
- `index.html` — Medigrade-led homepage
- `medigrade.html` — full Medigrade protocol
- `products.html` — catalog with grade filters
- `about.html` — updated story
- `privacy.html`
- `/w/` — WhatsApp redirect

## Catalog data
- `catalog/catalog.json` (edit products here)

Each product supports:
- `grade`: `medigrade` | `premium` | `clean`
- `type`: `import` | `regional` | `organic`

## Run locally
Just open `index.html` in a browser.

> Note: Some browsers block `fetch()` from `file://` URLs.
If the catalog doesn't load, run a tiny local server:
- Python: `python -m http.server 8000`
Then open: http://localhost:8000

## Deploy on Vercel
1. Push this folder to GitHub
2. Import in Vercel
3. Deploy

Optional:
- `api/catalog.js` provides `/api/catalog` if you want a serverless endpoint.

## Customize
- Update WhatsApp number in `/w/index.html`
- Replace images in `/assets/`
- Update meta tags as needed

© Fruit Story · Swara Ascent IMPEX
