
// --- UI MOTION (Anicham-style micro-interactions) ---
(function(){
  // Reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {threshold: .12});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  // Cursor glow (desktop only)
  const glow = document.createElement("div");
  glow.className = "cursorGlow";
  document.body.appendChild(glow);

  let last = {x: window.innerWidth/2, y: window.innerHeight/2};
  let raf = 0;
  const move = (x,y)=>{
    last.x = x; last.y = y;
    if(!raf){
      raf = requestAnimationFrame(()=>{
        glow.style.left = last.x + "px";
        glow.style.top = last.y + "px";
        raf = 0;
      });
    }
  };

  const isTouch = matchMedia("(pointer: coarse)").matches;
  if(!isTouch){
    glow.classList.add("on");
    window.addEventListener("pointermove",(e)=>move(e.clientX,e.clientY), {passive:true});
    window.addEventListener("pointerdown",(e)=>move(e.clientX,e.clientY), {passive:true});
  }

  // Magnetic buttons
  const mag = (el)=>{
    const strength = 10;
    el.addEventListener("mousemove",(e)=>{
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width/2);
      const dy = e.clientY - (r.top + r.height/2);
      el.style.transform = `translate(${dx/r.width*strength}px, ${dy/r.height*strength}px)`;
    });
    el.addEventListener("mouseleave",()=>{ el.style.transform = ""; });
  };
  document.querySelectorAll(".btn.mag, .iconbtn.mag").forEach(mag);

  // Announcement marquee (duplicate content for seamless loop)
  const bar = document.getElementById("announceBar");
  if(bar){
    const items = (bar.dataset.items || "").split("|").map(s=>s.trim()).filter(Boolean);
    if(items.length){
      const track = document.createElement("div");
      track.className = "marquee";
      const build = ()=> items.map(t=>`<span class="small">${t}</span>`).join('<span class="small">·</span>');
      track.innerHTML = build() + '<span class="small">·</span>' + build();
      bar.innerHTML = "";
      bar.appendChild(track);
    }
  }
})();


const SITE_URL = "./catalog/site.json?v=1";
const CATALOG_URL = "./catalog/catalog.json?v=1";

const state = {
  site: null,
  catalog: [],
  cart: JSON.parse(localStorage.getItem("fs_cart") || "{}"),
  wish: JSON.parse(localStorage.getItem("fs_wish") || "{}"),
};


function setupReveal() {
  const els = Array.from(document.querySelectorAll(".reveal, .stagger"));
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });

  els.forEach((el) => io.observe(el));
}

function setupMarquee() {
  const bar = document.getElementById("announceBar");
  if (!bar) return;

  // wrap existing pills into a marquee that loops smoothly
  const pills = Array.from(bar.querySelectorAll(".pill"));
  if (!pills.length) return;

  const wrap = document.createElement("div");
  wrap.className = "marquee";
  pills.forEach((p) => wrap.appendChild(p));
  // duplicate for seamless loop
  pills.forEach((p) => wrap.appendChild(p.cloneNode(true)));

  bar.innerHTML = "";
  bar.appendChild(wrap);
}

function setupPageTransitions() {
  // fade out only for internal navigation
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("#")) return;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      document.body.classList.add("page-out");
      setTimeout(() => { window.location.href = href; }, 160);
    });
  });
}

const fmt = (n) => "₹ " + Number(n || 0).toLocaleString("en-IN");

function save() {
  localStorage.setItem("fs_cart", JSON.stringify(state.cart));
  localStorage.setItem("fs_wish", JSON.stringify(state.wish));
}

function cartCount() {
  return Object.values(state.cart).reduce((a, b) => a + ((b && b.qty) || 0), 0);
}
function wishCount() {
  return Object.values(state.wish).filter(Boolean).length;
}
function updateBadges() {
  const c = document.getElementById("cartCount");
  const w = document.getElementById("wishCount");
  if (c) c.textContent = String(cartCount());
  if (w) w.textContent = String(wishCount());
}

function gradeLabel(g) {
  const x = String(g || "").toLowerCase();
  if (x === "medigrade") return "MEDIGRADE™";
  if (x === "premium") return "Premium";
  if (x === "clean") return "Clean";
  return x || "Premium";
}
function gradeClass(g) {
  const x = String(g || "").toLowerCase();
  if (x === "medigrade") return "medigrade";
  if (x === "premium") return "premium";
  if (x === "clean") return "clean";
  return "premium";
}

function openDrawer(id) {
  const overlay = document.getElementById("overlay");
  if (overlay) overlay.classList.add("show");
  const d = document.getElementById(id);
  if (d) d.classList.add("open");
}
function closeDrawers() {
  const overlay = document.getElementById("overlay");
  if (overlay) overlay.classList.remove("show");
  ["cartDrawer", "searchDrawer"].forEach((id) => {
    const d = document.getElementById(id);
    if (d) d.classList.remove("open");
  });
}

function toggleDisclaimer() {
  const k = "fs_disclaimer_ok";
  if (localStorage.getItem(k)) return;
  const m = document.getElementById("disclaimer");
  if (!m) return;
  m.classList.add("show");
  const btn = document.getElementById("acceptDisclaimer");
  if (btn) btn.addEventListener("click", () => {
    localStorage.setItem(k, "1");
    m.classList.remove("show");
  });
}

function waLink(message) {
  const phone = (state.site && state.site.whatsapp) || "919600785855";
  const text = encodeURIComponent(message);
  return "https://wa.me/" + phone + "?text=" + text;
}

function addToCart(id) {
  const item = state.catalog.find((x) => x.id === id);
  if (!item) return;
  const cur = state.cart[id] || { qty: 0 };
  cur.qty += 1;
  cur.name = item.name;
  cur.price = item.price;
  cur.unit = item.unit || "";
  cur.grade = item.grade || "premium";
  cur.img = item.img || "";
  state.cart[id] = cur;
  save();
  updateBadges();
  renderCart();
}

function setQty(id, qty) {
  if (qty <= 0) delete state.cart[id];
  else state.cart[id].qty = qty;
  save();
  updateBadges();
  renderCart();
}

function toggleWish(id) {
  state.wish[id] = !state.wish[id];
  save();
  updateBadges();
  if (document.getElementById("picksGrid")) renderPicks();
  renderCatalogPage();
  wireCatalogPage();
}

function subtotal() {
  return Object.values(state.cart).reduce((a, ci) => a + ((ci.qty || 0) * (ci.price || 0)), 0);
}

function renderAnnouncements() {
  const bar = document.getElementById("announceBar");
  if (!bar || !state.site) return;
  bar.innerHTML = "";
  (state.site.announcements || []).forEach((t) => {
    const span = document.createElement("div");
    span.className = "pill";
    span.textContent = t;
    bar.appendChild(span);
  });
}

function renderCollections() {
  const grid = document.getElementById("collectionGrid");
  if (!grid) return;

  const collections = [
    { key: "medigrade", title: "MEDIGRADE™", img: "./assets/col-medigrade.jpg", desc: "Clinically screened · batch cleared" },
    { key: "premium", title: "Premium", img: "./assets/col-premium.jpg", desc: "High quality · standard checks" },
    { key: "clean", title: "Clean", img: "./assets/col-clean.jpg", desc: "Clean handling · everyday" },
    { key: "berries", title: "Berries", img: "./assets/col-berries.jpg", desc: "Fresh seasonal picks" },
    { key: "imports", title: "Imports", img: "./assets/col-imports.jpg", desc: "Global growers · D2C" },
    { key: "kids", title: "Kids & Moms", img: "./assets/col-kids.jpg", desc: "Sensitive needs focus" },
  ];

  grid.innerHTML = "";
  collections.forEach((c) => {
    const el = document.createElement("div");
    el.className = "tile";
    el.innerHTML = `
      <img src="${c.img}" alt="${c.title}"/>
      <div class="pad">
        <div class="title">${c.title}</div>
        <div class="small">${c.desc}</div>
        <div class="btnrow">
          <button class="btn primary" data-collection="${c.key}">View</button>
          <button class="btn" data-ask="${c.key}">Ask on WhatsApp</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  });

  grid.querySelectorAll("button[data-collection]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const k = btn.getAttribute("data-collection");
      openDrawer("searchDrawer");
      const input = document.getElementById("searchInput");
      if (input) {
        input.value = (k === "kids") ? "medigrade" : k;
        runSearch();
      }
    });
  });

  grid.querySelectorAll("button[data-ask]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const k = btn.getAttribute("data-ask");
      const msg = (k === "medigrade")
        ? "Hi Fruit Story, I want to order MEDIGRADE™ fruits. Please share this week’s cleared batch slots."
        : ("Hi Fruit Story, please share available " + k + " fruit options and today’s delivery feasibility.");
      window.open(waLink(msg), "_blank");
    });
  });
}

function pickItems() {
  const meds = state.catalog.filter((x) => String(x.grade).toLowerCase() === "medigrade");
  const others = state.catalog.filter((x) => String(x.grade).toLowerCase() !== "medigrade");
  return meds.concat(others).slice(0, 8);
}

function productCard(item) {
  const wished = !!state.wish[item.id];
  return `
    <div class="tile">
      <img src="${item.img || "./assets/hero.jpg"}" alt="${item.name}"/>
      <div class="pad">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px">
          <div class="title">${item.name}</div>
          <button class="iconbtn" style="width:40px;height:40px" data-wish="${item.id}" aria-label="Wishlist">${wished ? "♥" : "♡"}</button>
        </div>
        <div class="small">${item.origin || ""}</div>
        <div class="meta">
          <div><b>${fmt(item.price)}</b> <span class="small">${item.unit || ""}</span></div>
          <span class="tag ${gradeClass(item.grade)}">${gradeLabel(item.grade)}</span>
        </div>
        <div class="btnrow">
          <button class="btn primary" data-add="${item.id}">Add to cart</button>
          <button class="btn" data-buy="${item.id}">WhatsApp</button>
        </div>
      </div>
    </div>
  `;
}

function renderCatalogPage() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const sel = document.getElementById("collectionFilter");
  const qEl = document.getElementById("catalogSearch");
  // Build options
  if (sel && !sel.dataset.ready) {
    const options = ["All"].concat(state.collections || []);
    sel.innerHTML = options.map((c) => `<option value="${c}">${c}</option>`).join("");
    sel.value = "All";
    sel.dataset.ready = "1";
  }

  const q = (qEl?.value || "").trim().toLowerCase();
  const col = (sel?.value || "All");

  const items = (state.catalog || []).filter((it) => {
    const okC = col === "All" || (it.collection || "") === col;
    const okQ = !q || (it.name || "").toLowerCase().includes(q) || (it.origin || "").toLowerCase().includes(q) || (it.grade || "").toLowerCase().includes(q) || (it.tags || []).join(" ").toLowerCase().includes(q);
    return okC && okQ;
  });

  grid.innerHTML = items.map(productCard).join("");
  // wire product buttons in this newly rendered grid
  grid.querySelectorAll("button[data-buy]").forEach((b) => b.addEventListener("click", () => addToCart(b.dataset.buy)));
  grid.querySelectorAll("button[data-wish]").forEach((b) => b.addEventListener("click", () => toggleWish(b.dataset.wish)));
  grid.classList.add("in");
}

function wireCatalogPage() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const sel = document.getElementById("collectionFilter");
  const qEl = document.getElementById("catalogSearch");
  sel?.addEventListener("change", renderCatalogPage);
  qEl?.addEventListener("input", renderCatalogPage);
}


function renderPicks() {
  const grid = document.getElementById("picksGrid");
  if (!grid) return;
  grid.innerHTML = pickItems().map(productCard).join("");

  grid.querySelectorAll("button[data-add]").forEach((b) => b.addEventListener("click", () => addToCart(b.dataset.add)));
  grid.querySelectorAll("button[data-buy]").forEach((b) => b.addEventListener("click", () => {
    const item = state.catalog.find((x) => x.id === b.dataset.buy);
    if (!item) return;
    const msg = "Hi Fruit Story, I want to order: " + item.name + "\\nGrade: " + gradeLabel(item.grade) + "\\nPlease confirm availability & price.";
    window.open(waLink(msg), "_blank");
  }));
  grid.querySelectorAll("button[data-wish]").forEach((b) => b.addEventListener("click", () => toggleWish(b.dataset.wish)));
}

function renderCart() {
  const wrap = document.getElementById("cartItems");
  const empty = document.getElementById("cartEmpty");
  const sub = document.getElementById("cartSubtotal");
  if (!wrap || !sub) return;

  const items = Object.entries(state.cart).map(([id, ci]) => {
    const item = state.catalog.find((x) => x.id === id) || {};
    return {
      id,
      name: ci.name || item.name || id,
      price: ci.price || item.price || 0,
      qty: ci.qty || 0,
      unit: ci.unit || item.unit || "",
      grade: ci.grade || item.grade || "premium",
      img: ci.img || item.img || "./assets/hero.jpg",
    };
  });

  if (!items.length) {
    wrap.innerHTML = "";
    if (empty) empty.style.display = "block";
  } else {
    if (empty) empty.style.display = "none";
    wrap.innerHTML = items.map((x) => `
      <div class="cartItem">
        <img src="${x.img}" alt="${x.name}"/>
        <div style="flex:1">
          <div style="display:flex; justify-content:space-between; gap:10px">
            <div><b>${x.name}</b><div class="small">${gradeLabel(x.grade)} · ${x.unit}</div></div>
            <div><b>${fmt(x.price)}</b></div>
          </div>
          <div class="qtyRow">
            <button class="qtyBtn" data-minus="${x.id}">−</button>
            <div><b>${x.qty}</b></div>
            <button class="qtyBtn" data-plus="${x.id}">+</button>
            <button class="btn" style="padding:7px 10px" data-remove="${x.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  sub.textContent = fmt(subtotal());

  wrap.querySelectorAll("button[data-minus]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.minus;
    setQty(id, (state.cart[id]?.qty || 0) - 1);
  }));
  wrap.querySelectorAll("button[data-plus]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.plus;
    setQty(id, (state.cart[id]?.qty || 0) + 1);
  }));
  wrap.querySelectorAll("button[data-remove]").forEach((b) => b.addEventListener("click", () => setQty(b.dataset.remove, 0)));
}

function runSearch() {
  const q = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
  const out = document.getElementById("searchResults");
  if (!out) return;

  let items = state.catalog;
  if (q) {
    items = items.filter((x) => {
      const hay = (String(x.name||"") + " " + String(x.origin||"") + " " + String(x.grade||"") + " " + String(x.type||"") + " " + String(x.description||"")).toLowerCase();
      return hay.includes(q);
    });
  }

  out.innerHTML = items.slice(0, 9).map(productCard).join("");
  out.querySelectorAll("button[data-add]").forEach((b) => b.addEventListener("click", () => addToCart(b.dataset.add)));
  out.querySelectorAll("button[data-buy]").forEach((b) => b.addEventListener("click", () => {
    const item = state.catalog.find((x) => x.id === b.dataset.buy);
    if (!item) return;
    const msg = "Hi Fruit Story, I want to order: " + item.name + "\\nGrade: " + gradeLabel(item.grade) + "\\nPlease confirm availability & price.";
    window.open(waLink(msg), "_blank");
  }));
  out.querySelectorAll("button[data-wish]").forEach((b) => b.addEventListener("click", () => toggleWish(b.dataset.wish)));
}

async function load() {
  const [siteRes, catRes] = await Promise.all([
    fetch(SITE_URL, { cache: "no-store" }),
    fetch(CATALOG_URL, { cache: "no-store" }),
  ]);
  state.site = await siteRes.json();
  state.catalog = await catRes.json();
  renderAnnouncements();
  setupMarquee();
  renderCollections();
  renderPicks();
  renderCatalogPage();
  wireCatalogPage();
  renderCart();
  updateBadges();
  toggleDisclaimer();
}

function wire() {
  document.getElementById("overlay")?.addEventListener("click", closeDrawers);

  document.getElementById("btnCart")?.addEventListener("click", () => openDrawer("cartDrawer"));
  document.getElementById("btnOpenCart")?.addEventListener("click", () => openDrawer("cartDrawer"));
  document.getElementById("closeCart")?.addEventListener("click", closeDrawers);

  document.getElementById("btnSearch")?.addEventListener("click", () => {
    openDrawer("searchDrawer");
    document.getElementById("searchInput")?.focus();
    runSearch();
  });
  document.getElementById("btnOpenSearch")?.addEventListener("click", () => {
    openDrawer("searchDrawer");
    document.getElementById("searchInput")?.focus();
    runSearch();
  });
  document.getElementById("closeSearch")?.addEventListener("click", closeDrawers);
  document.getElementById("searchInput")?.addEventListener("input", runSearch);

  document.getElementById("btnWishlist")?.addEventListener("click", () => {
    openDrawer("searchDrawer");
    const out = document.getElementById("searchResults");
    const ids = Object.entries(state.wish).filter(([, v]) => v).map(([k]) => k);
    const items = state.catalog.filter((x) => ids.includes(x.id));
    out.innerHTML = items.length ? items.map(productCard).join("") : `<div class="small">No items in wishlist yet.</div>`;
    out.querySelectorAll("button[data-add]").forEach((b) => b.addEventListener("click", () => addToCart(b.dataset.add)));
    out.querySelectorAll("button[data-buy]").forEach((b) => b.addEventListener("click", () => {
      const item = state.catalog.find((x) => x.id === b.dataset.buy);
      if (!item) return;
      const msg = "Hi Fruit Story, I want to order: " + item.name + "\\nGrade: " + gradeLabel(item.grade) + "\\nPlease confirm availability & price.";
      window.open(waLink(msg), "_blank");
    }));
    out.querySelectorAll("button[data-wish]").forEach((b) => b.addEventListener("click", () => toggleWish(b.dataset.wish)));
  });

  document.getElementById("btnCheckout")?.addEventListener("click", () => {
    const note = (document.getElementById("cartNote")?.value || "").trim();
    const items = Object.entries(state.cart).map(([id, ci]) => {
      return "- " + ci.name + " (" + gradeLabel(ci.grade) + ") x" + ci.qty + " = " + fmt((ci.price || 0) * ci.qty);
    });
    const msg = "Hi Fruit Story, I want to order:\n\n" + items.join("\n") + "\n\nSubtotal: " + fmt(subtotal()) + (note ? ("\n\nNote: " + note) : "") + "\n\nPlease confirm availability & delivery slot.";
    window.open(waLink(msg), "_blank");
  });

  document.getElementById("btnQuickOrder")?.addEventListener("click", () => {
    window.open(waLink("Hi Fruit Story, I want to order MEDIGRADE™ fruits. Please share this week’s cleared batch slots."), "_blank");
  });
  document.getElementById("btnOrderMedigrade")?.addEventListener("click", () => {
    window.open(waLink("Hi Fruit Story, I want to order MEDIGRADE™ fruits. Please share this week’s cleared batch slots."), "_blank");
  });
  document.getElementById("btnAskSlots")?.addEventListener("click", () => {
    window.open(waLink("Hi Fruit Story, please share the cleared Medigrade list for this week and available delivery slots."), "_blank");
  });

  document.getElementById("btnSubscribe")?.addEventListener("click", () => {
    const email = (document.getElementById("newsletterEmail")?.value || "").trim();
    if (!email) return;
    const msg = document.getElementById("subMsg");
    if (msg) msg.style.display = "block";
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  wire();
  setupPageTransitions();
  setupReveal();
  await load();
});


// Minimal exports (helps reuse inside other pages / custom scripts)
window.FS = {
  state,
  renderAnnouncements,
  renderCollections,
  renderPicks,
  renderCatalogPage,
  wireCatalogPage,
  setupReveal,
  setupMarquee,
  setupPageTransitions,
  load,
  wire
};
