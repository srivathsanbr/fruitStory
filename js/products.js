
async function loadCatalog() {
  const res = await fetch('./catalog/catalog.json?v=1', { cache: 'no-store' });
  if(!res.ok) throw new Error('Failed to load catalog.json');
  return await res.json();
}

function whatsappLink(item) {
  const msg = encodeURIComponent(`Hi Fruit Story, I want to order: ${item.name} (${
"}item.unit{"}) – please confirm availability & price.`);
  return `https://wa.me/+918870916226?text=${msg}`;
}

function callLink() {
  return 'tel:+918870916226';
}

function render(items) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'product';
    el.innerHTML = `
      <img src="${item.img || './assets/hero.svg'}" alt="${item.name}"/>
      <div class="info">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <b>${item.name}</b>
          <span class="tag">${item.type}</span>
        </div>
        <div class="small">${item.origin || ''}</div>
        <div>₹ ${item.price} <span class="small">${item.unit || ''}</span></div>
        <div class="small">${item.description || ''}</div>
        <div class="actions">
          <a class="btn btn-warning" target="_blank" rel="noopener" href="${whatsappLink(item)}">WhatsApp</a>
          <a class="btn" href="${callLink()}">Call</a>
        </div>
      </div>`;
    grid.appendChild(el);
  });
}

function applyFilters(data) {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const type = document.getElementById('type').value;
  const sort = document.getElementById('sort').value;

  let items = data.filter(x => {
    const hay = (x.name + ' ' + (x.description||'') + ' ' + (x.origin||'') + ' ' + (x.type||'')).toLowerCase();
    const matchesQ = !q || hay.includes(q);
    const matchesType = !type || x.type === type;
    return matchesQ && matchesType;
  });

  if (sort === 'name-asc') items.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc') items.sort((a,b) => b.name.localeCompare(a.name));
  if (sort === 'price-asc') items.sort((a,b) => (a.price||0)-(b.price||0));
  if (sort === 'price-desc') items.sort((a,b) => (b.price||0)-(a.price||0));

  render(items);
}

window.addEventListener('DOMContentLoaded', async () => {
  const data = await loadCatalog();
  ['search','type','sort'].forEach(id => document.getElementById(id).addEventListener('input', () => applyFilters(data)));
  applyFilters(data);
});
