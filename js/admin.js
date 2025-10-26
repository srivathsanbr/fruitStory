
const PASSWORD = 'FruitStory@admin';
let catalog = [];
let unlocked = false;

async function loadCatalog() {
  const res = await fetch('./catalog/catalog.json?v=1', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load catalog.json');
  return await res.json();
}

function renderTable() {
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = '';
  catalog.forEach((x, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${x.id||''}</td>
      <td>${x.name||''}</td>
      <td>${x.type||''}</td>
      <td>${x.price||''}</td>
      <td>${x.unit||''}</td>
      <td>${x.origin||''}</td>
      <td>
        <button data-idx="${idx}" class="btn small-btn edit">Edit</button>
        <button data-idx="${idx}" class="btn small-btn delete">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', (e) => {
    const i = Number(e.target.getAttribute('data-idx'));
    fillForm(catalog[i]);
  }));
  tbody.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', (e) => {
    const i = Number(e.target.getAttribute('data-idx'));
    catalog.splice(i,1);
    renderTable();
  }));
}

function fillForm(item) {
  document.getElementById('id').value = item.id||'';
  document.getElementById('name').value = item.name||'';
  document.getElementById('price').value = item.price||'';
  document.getElementById('unit').value = item.unit||'';
  document.getElementById('type').value = item.type||'import';
  document.getElementById('origin').value = item.origin||'';
  document.getElementById('img').value = item.img||'';
  document.getElementById('desc').value = item.description||'';
}

function formItem() {
  return {
    id: document.getElementById('id').value.trim(),
    name: document.getElementById('name').value.trim(),
    price: Number(document.getElementById('price').value || 0),
    unit: document.getElementById('unit').value.trim(),
    type: document.getElementById('type').value,
    origin: document.getElementById('origin').value.trim(),
    img: document.getElementById('img').value.trim(),
    description: document.getElementById('desc').value.trim(),
  };
}

function upsertItem(newItem) {
  const idx = catalog.findIndex(x => x.id === newItem.id);
  if (idx >= 0) catalog[idx] = newItem; else catalog.push(newItem);
  renderTable();
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'catalog.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('unlock').addEventListener('click', async () => {
    const v = document.getElementById('pwd').value;
    if (v !== PASSWORD) { alert('Wrong password'); return; }
    unlocked = true;
    document.getElementById('panel').style.display = 'block';
    try {
      catalog = await loadCatalog();
    } catch (e) {
      catalog = [];
    }
    renderTable();
  });

  document.getElementById('save').addEventListener('click', () => {
    if (!unlocked) return alert('Unlock first');
    const item = formItem();
    if (!item.id) return alert('ID required');
    if (!item.name) return alert('Name required');
    upsertItem(item);
  });

  document.getElementById('download').addEventListener('click', () => {
    if (!unlocked) return alert('Unlock first');
    downloadJSON();
  });
});
