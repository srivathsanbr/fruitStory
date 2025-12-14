// js/products.js

function resolveDriveUrl(u) {
  try {
    const url = new URL(u);
    const host = url.hostname;
    const params = url.searchParams;

    if (host.includes("drive.google.com")) {
      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)\//);
      if (fileMatch && fileMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
      }
      const idParam = params.get("id");
      if (idParam) {
        return `https://drive.google.com/uc?export=view&id=${idParam}`;
      }
    }
  } catch (_) {}
  return u;
}

function resolveImageUrl(u) {
  if (!u || typeof u !== "string") return "./assets/hero.svg";
  const trimmed = u.trim();
  if (!trimmed) return "./assets/hero.svg";
  return resolveDriveUrl(trimmed);
}

async function loadCatalog() {
  const res = await fetch("/api/catalog", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load catalog");
  return await res.json();
}

function normGrade(g) {
  const x = String(g || "").trim().toLowerCase();
  if (!x) return "premium"; // default for old items that don't have grade yet
  if (x === "medigrade") return "medigrade";
  if (x === "premium") return "premium";
  if (x === "clean") return "clean";
  return x;
}

function gradeLabel(g) {
  const x = normGrade(g);
  if (x === "medigrade") return "MEDIGRADE™";
  if (x === "premium") return "Premium";
  if (x === "clean") return "Clean";
  return x;
}

function whatsappLink(item) {
  const g = gradeLabel(item.grade);
  const msg = `Hi Fruit Story, I want to order: ${item.name} (${item.unit || ""})
Grade: ${g}
Please confirm availability & price.`;
  const m = encodeURIComponent(msg);
  return `/w/?utm_source=products&utm_medium=button&utm_campaign=order&loc=card&m=${m}`;
}

function callLink() {
  return "tel:+919790976381";
}

function createImageEl(item) {
  const img = document.createElement("img");
  img.loading = "lazy";
  img.decoding = "async";
  img.alt = item.name || "Fruit";
  img.src = resolveImageUrl(item.img);
  img.onerror = () => {
    img.onerror = null;
    img.src = "./assets/hero.svg";
  };
  return img;
}

function gradeClass(g) {
  const x = normGrade(g);
  if (x === "medigrade") return "grade-medigrade";
  if (x === "premium") return "grade-premium";
  if (x === "clean") return "grade-clean";
  return "grade-premium";
}

function render(items) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "product";

    const img = createImageEl(item);

    const info = document.createElement("div");
    info.className = "info";

    const g = gradeLabel(item.grade);
    const gCls = gradeClass(item.grade);

    info.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <b>${item.name || ""}</b>
        <span class="tag ${gCls}">${g}</span>
      </div>
      <div class="small">${item.origin || ""}</div>
      <div><b>₹ ${item.price ?? ""}</b> <span class="small">${item.unit || ""}</span></div>
      <div class="small">${item.description || ""}</div>

      <div class="actions">
        <a class="btn btn-primary" href="${whatsappLink(item)}">WhatsApp</a>
        <a class="btn" href="${callLink()}">Call</a>
      </div>
    `;

    card.appendChild(img);
    card.appendChild(info);
    grid.appendChild(card);
  });
}

function getParam(name) {
  const u = new URL(window.location.href);
  return (u.searchParams.get(name) || "").trim();
}

function applyFilters(data) {
  const q = (document.getElementById("search")?.value || "").trim().toLowerCase();
  const grade = (document.getElementById("grade")?.value || "").trim().toLowerCase();
  const type = (document.getElementById("type")?.value || "").trim().toLowerCase();
  const sort = document.getElementById("sort")?.value || "";

  let items = data.filter((x) => {
    const hay = (
      (x.name || "") +
      " " +
      (x.description || "") +
      " " +
      (x.origin || "") +
      " " +
      (x.type || "") +
      " " +
      (x.grade || "")
    ).toLowerCase();

    const matchesQ = !q || hay.includes(q);
    const matchesGrade = !grade || normGrade(x.grade) === grade;
    const matchesType = !type || String(x.type || "").toLowerCase() === type;

    return matchesQ && matchesGrade && matchesType;
  });

  if (sort === "name-asc") items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  if (sort === "name-desc") items.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  if (sort === "price-asc") items.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sort === "price-desc") items.sort((a, b) => (b.price || 0) - (a.price || 0));

  render(items);
}

window.addEventListener("DOMContentLoaded", async () => {
  const data = await loadCatalog();

  // URL preset: /products.html?grade=medigrade&type=import
  const presetGrade = getParam("grade");
  const presetType = getParam("type");

  if (presetGrade && document.getElementById("grade")) document.getElementById("grade").value = presetGrade;
  if (presetType && document.getElementById("type")) document.getElementById("type").value = presetType;

  ["search", "grade", "type", "sort"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => applyFilters(data));
    if (el) el.addEventListener("change", () => applyFilters(data));
  });

  applyFilters(data);
});
