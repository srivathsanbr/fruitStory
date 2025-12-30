const CATALOG_URL = "./catalog/catalog.json";

function normGrade(g){
  const x = String(g || "").trim().toLowerCase();
  if (!x) return "premium";
  if (x === "medigrade") return "medigrade";
  if (x === "premium") return "premium";
  if (x === "clean") return "clean";
  return x;
}
function gradeLabel(g){
  const x = normGrade(g);
  if (x === "medigrade") return "MEDIGRADE™";
  if (x === "premium") return "Premium";
  if (x === "clean") return "Clean";
  return x;
}
function gradeClass(g){
  const x = normGrade(g);
  if (x === "medigrade") return "medigrade";
  if (x === "premium") return "premium";
  if (x === "clean") return "clean";
  return "premium";
}

async function loadCatalog(){
  const res = await fetch(CATALOG_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load catalog");
  return await res.json();
}

function getParam(name){
  const u = new URL(window.location.href);
  return (u.searchParams.get(name) || "").trim();
}

function whatsappLink(item){
  const g = gradeLabel(item.grade);
  const msg = `Hi Fruit Story, I want to order: ${item.name} (${item.unit || ""})
Grade: ${g}
Please confirm availability & price.`;
  const m = encodeURIComponent(msg);
  return `./w/?m=${m}`;
}

function render(items){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  if (!items.length){
    grid.innerHTML = `<div class="card" style="grid-column:1/-1">No products match your filters.</div>`;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "product";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = item.name || "Fruit";
    img.src = item.img || "./assets/medigrade-hero.jpg";
    img.onerror = () => { img.src = "./assets/medigrade-hero.jpg"; };

    const info = document.createElement("div");
    info.className = "info";

    const g = gradeLabel(item.grade);
    const cls = gradeClass(item.grade);

    info.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <b>${item.name || ""}</b>
        <span class="tag ${cls}">${g}</span>
      </div>
      <div class="small">${item.origin || ""}</div>
      <div><b>₹ ${item.price ?? ""}</b> <span class="small">${item.unit || ""}</span></div>
      <div class="small">${item.description || ""}</div>
      <div class="actions">
        <a class="btn primary" href="${whatsappLink(item)}">WhatsApp</a>
        <a class="btn" href="tel:+919790976381">Call</a>
      </div>
    `;

    card.appendChild(img);
    card.appendChild(info);
    grid.appendChild(card);
  });
}

function applyFilters(data){
  const q = (document.getElementById("search")?.value || "").trim().toLowerCase();
  const grade = (document.getElementById("grade")?.value || "").trim().toLowerCase();
  const type = (document.getElementById("type")?.value || "").trim().toLowerCase();
  const sort = document.getElementById("sort")?.value || "";

  let items = data.filter((x) => {
    const hay = ((x.name||"")+" "+(x.description||"")+" "+(x.origin||"")+" "+(x.type||"")+" "+(x.grade||"")).toLowerCase();
    const matchesQ = !q || hay.includes(q);
    const matchesGrade = !grade || normGrade(x.grade) === grade;
    const matchesType = !type || String(x.type||"").toLowerCase() === type;
    return matchesQ && matchesGrade && matchesType;
  });

  if (sort === "name-asc") items.sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  if (sort === "name-desc") items.sort((a,b)=>(b.name||"").localeCompare(a.name||""));
  if (sort === "price-asc") items.sort((a,b)=>(a.price||0)-(b.price||0));
  if (sort === "price-desc") items.sort((a,b)=>(b.price||0)-(a.price||0));

  render(items);
}

window.addEventListener("DOMContentLoaded", async () => {
  const data = await loadCatalog();

  const presetGrade = getParam("grade");
  const presetType = getParam("type");
  if (presetGrade && document.getElementById("grade")) document.getElementById("grade").value = presetGrade;
  if (presetType && document.getElementById("type")) document.getElementById("type").value = presetType;

  ["search","grade","type","sort"].forEach((id)=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", ()=>applyFilters(data));
    el.addEventListener("change", ()=>applyFilters(data));
  });

  applyFilters(data);
});
