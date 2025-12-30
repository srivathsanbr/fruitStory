# Fruit Story — Complete Static Site (Medigrade Theme)

## Run locally
Option A: open `index.html` directly.  
If the catalog doesn't load (browser blocks fetch on file://), run:

```bash
python3 -m http.server 8000
```

Open: http://localhost:8000/

## Deploy (Vercel)
- Framework Preset: **Other**
- Build Command: **(leave empty)**
- Output Directory: **.**
- Root Directory: **(repo root)**

## Deploy (GitHub Pages)
- Deploy from branch: `main`
- Folder: `/ (root)`

Pages:
- `index.html`
- `products.html`
- `medigrade.html`
- `about.html`
- `privacy.html`, `terms.html`, `shipping.html`, `contact.html`

Data:
- `catalog/site.json`
- `catalog/catalog.json`
