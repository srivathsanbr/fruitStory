const PASSWORD = 'FruitStory@admin';
let catalog = [];

async function loadCatalog() {
  const res = await fetch('/api/catalog', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load catalog');
  return await res.json();
}

function renderTable() {
  const tbody = document.querySelector('#table tbody'); tbody.innerHTML = '';
  catalog.forEach((x, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${x.id||''}</td><td>${x.name||''}</td><td>${x.type||''}</td><td>${x.price||''}</td><td>${x.unit||''}</td><td>${x.origin||''}</td>
    <td><button data-idx="${idx}" class="btn small-btn edit">Edit</button> <button data-idx="${idx}" class="btn small-btn delete">Delete</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', (e)=>{ fillForm(catalog[Number(e.target.getAttribute('data-idx'))]); }));
  tbody.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', (e)=>{ catalog.splice(Number(e.target.getAttribute('data-idx')),1); renderTable(); }));
}

function fillForm(item){
  ['id','name','price','unit','type','origin','img','desc'].forEach(k=>{
    const el=document.getElementById(k); if(!el) return;
    el.value=(k==='desc'?item.description:item[k])||'';
  });
  document.getElementById('type').value=item.type||'import';
}

function formItem(){
  const $ = (id) => document.getElementById(id);
  return{
    id: $('id').value.trim(),
    name: $('name').value.trim(),
    price: Number($('price').value || 0),
    unit: $('unit').value.trim(),
    type: $('type').value,
    origin: $('origin').value.trim(),
    img: $('img').value.trim(),
    description: $('desc').value.trim()
  };
}

function upsertItem(newItem){
  const i=catalog.findIndex(x=>x.id===newItem.id);
  if(i>=0) catalog[i]=newItem; else catalog.push(newItem);
  renderTable();
}

function downloadJSON(){
  const blob=new Blob([JSON.stringify(catalog,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='catalog.json';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

async function copyJSON(){
  try{ await navigator.clipboard.writeText(JSON.stringify(catalog, null, 2)); alert('catalog.json copied'); }
  catch(e){ alert('Clipboard copy failed.'); }
}

async function reloadFromServer() {
  try { catalog = await loadCatalog(); renderTable(); alert('Loaded latest catalog from server.'); }
  catch { alert('Failed to load from server.'); }
}

// Robust save with clear error messages and double-click guard
async function saveToServer(){
  if (!window.__ADMIN_KEY__) {
    const k = prompt('Enter admin server key (Vercel ADMIN_SECRET):');
    if (!k) return alert('Admin key required.');
    window.__ADMIN_KEY__ = k;
  }

  if (!Array.isArray(catalog)) return alert('Catalog must be an array.');
  if (catalog.length === 0) {
    const ok = confirm('Catalog is empty. Overwrite server with an empty list?');
    if (!ok) return;
  }

  const btn = document.getElementById('save-server');
  const origText = btn?.textContent;
  try{
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    const res = await fetch('/api/catalog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': window.__ADMIN_KEY__ },
      body: JSON.stringify(catalog)
    });
    const raw = await res.text();
    let data; try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw || 'Unknown error' }; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    alert('Saved to server ✅');
  } catch (e) {
    console.error('Save failed:', e);
    alert('Server save failed: ' + (e?.message || e));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = origText || 'Save to server'; }
  }
}

window.addEventListener('DOMContentLoaded', async () =>{
  document.getElementById('unlock')?.addEventListener('click', async ()=>{
    if (document.getElementById('pwd').value !== PASSWORD) return alert('Wrong password');
    document.getElementById('panel').style.display='block';
    try{ catalog = await loadCatalog(); } catch(e){ catalog = []; }
    renderTable();
  });
  document.getElementById('save')?.addEventListener('click', ()=>{
    const item=formItem();
    if(!item.id) return alert('ID required');
    if(!item.name) return alert('Name required');
    upsertItem(item);
  });
  document.getElementById('download')?.addEventListener('click', downloadJSON);
  document.getElementById('copy')?.addEventListener('click', copyJSON);
  document.getElementById('save-server')?.addEventListener('click', saveToServer);
  document.getElementById('load-server')?.addEventListener('click', reloadFromServer);
});
