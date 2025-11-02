// js/products.js
function resolveDriveUrl(u) {
  // Convert common Google Drive share URLs -> direct view URL
  try {
    const url = new URL(u);
    const host = url.hostname;
    const params = url.searchParams;

    // Pattern: https://drive.google.com/file/d/FILE_ID/view?usp=...
    //          https://drive.google.com/uc?id=FILE_ID
    //          https://drive.google.com/open?id=FILE_ID
    if (host.includes('drive.google.com')) {
      // /file/d/{id}/...
      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)\//);
      if (fileMatch && fileMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
      }
      // ?id={id}
      const idParam = params.get('id');
      if (idParam) {
        return `https://drive.google.com/uc?export=view&id=${idParam}`;
      }
    }
  } catch (_) {
    // not a URL, ignore
  }
  return u;
}

function resolveImageUrl(u) {
  if (!u || typeof u !== 'string') return './assets/hero.svg';
  const trimmed = u.trim();
  if (!trimmed) return './assets/hero.svg';
  // Handle common Drive links
  return resolveDriveUrl(trimmed);
}

async function loadCatalog() {
  const res = await fetch('/api/catalog', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load catalog');
  return await res.json();
}

function whatsappLink(item) {
  const msg = encodeURIComponent(`Hi Fruit Story, I want to order: ${item.name} (${item.unit}) – please confirm availability & price.`);
  return `https://wa.me/919600785855?text=${msg}`;
}
function callLink() { return 'tel:+919790976381'; }

function createImageEl(item) {
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = item.name || 'Fruit';
  img.src = resolveImageUrl(item.img);
  // graceful fallback if image fails to load (404, CORS, etc.)
  img.onerror = () => {
    img.onerror = null; // prevent loops
    img.src = './assets/hero.svg';
  };
  return img;
}

function render(items) {
  const grid = document.getElementById('grid'); 
  grid.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div'); 
    card.className = 'product';

    const img = createImageEl(item);

    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <b>${item.name || ''}</b><span class="tag">${item.type || ''}</span>
      </div>
      <div class="small">${item.origin || ''}</div>
      <div>₹ ${item.price ?? ''} <span class="small">${item.unit || ''}</span></div>
      <div class="small">${item.description || ''}</div>
      <div class="actions">
        <a class="btn btn-warning" target="_blank" rel="noopener" href="${whatsappLink(item)}">WhatsApp</a>
        <a class="btn" href="${callLink()}">Call</a>
      </div>
    `;

    card.appendChild(img);
    card.appendChild(info);
    grid.appendChild(card);
  });
}

function applyFilters(data) {
  const q = (document.getElementById('search')?.value || '').trim().toLowerCase();
  const type = document.getElementById('type')?.value || '';
  const sort = document.getElementById('sort')?.value || '';

  let items = data.filter(x => {
    const hay = (x.name + ' ' + (x.description||'') + ' ' + (x.origin||'') + ' ' + (x.type||'')).toLowerCase();
    const matchesQ = !q || hay.includes(q);
    const matchesType = !type || x.type === type;
    return matchesQ && matchesType;
  });

  if (sort === 'name-asc') items.sort((a,b)=>a.name.localeCompare(b.name));
  if (sort === 'name-desc') items.sort((a,b)=>b.name.localeCompare(a.name));
  if (sort === 'price-asc') items.sort((a,b)=>(a.price||0)-(b.price||0));
  if (sort === 'price-desc') items.sort((a,b)=>(b.price||0)-(a.price||0));

  render(items);
}

window.addEventListener('DOMContentLoaded', async () => {
  const data = await loadCatalog();
  ['search','type','sort'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => applyFilters(data));
  });
  applyFilters(data);
});
