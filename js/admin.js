
const PASSWORD = 'FruitStory@admin';
let catalog = []; let unlocked = false;
async function loadCatalog() {
  const res = await fetch('./catalog/catalog.json?v=4', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load catalog.json');
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
function fillForm(item){['id','name','price','unit','type','origin','img','desc'].forEach(k=>{const el=document.getElementById(k); if(!el) return; el.value=(k==='desc'?item.description:item[k])||''}); document.getElementById('type').value=item.type||'import';}
function formItem(){return{ id: id.value.trim(), name: name.value.trim(), price: Number(price.value||0), unit: unit.value.trim(), type: type.value, origin: origin.value.trim(), img: img.value.trim(), description: desc.value.trim() };}
function upsertItem(newItem){ const i=catalog.findIndex(x=>x.id===newItem.id); if(i>=0) catalog[i]=newItem; else catalog.push(newItem); renderTable();}
function downloadJSON(){ const blob=new Blob([JSON.stringify(catalog,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='catalog.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);}
window.addEventListener('DOMContentLoaded', async () =>{
  document.getElementById('unlock').addEventListener('click', async ()=>{
    if (document.getElementById('pwd').value !== PASSWORD) return alert('Wrong password');
    document.getElementById('panel').style.display='block';
    try{ catalog = await loadCatalog(); } catch(e){ catalog = []; }
    renderTable();
  });
  document.getElementById('save').addEventListener('click', ()=>{ const item=formItem(); if(!item.id) return alert('ID required'); if(!item.name) return alert('Name required'); upsertItem(item); });
  document.getElementById('download').addEventListener('click', ()=>{ downloadJSON(); });
});
