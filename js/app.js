const SITE_URL = "./catalog/site.json";
const CATALOG_URL = "./catalog/catalog.json";
const state = {
  site: null,
  catalog: [],
  cart: JSON.parse(localStorage.getItem("fs_cart") || "[]"),
  wish: JSON.parse(localStorage.getItem("fs_wish") || "[]"),
};
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
const fmt = (n) => new Intl.NumberFormat("en-IN").format(Number(n||0));

function save(){ localStorage.setItem("fs_cart", JSON.stringify(state.cart)); localStorage.setItem("fs_wish", JSON.stringify(state.wish)); renderBadges(); }
function gradeLabel(g){ const m={medigrade:"MEDIGRADE™",premium:"Premium",clean:"Clean"}; return m[(g||"").toLowerCase()] || (g||""); }
function waLink(message){ const num = state.site?.whatsapp || "919600000000"; return `https://wa.me/${num}?text=${encodeURIComponent(message)}`; }

function renderBadges(){
  const cartCount = state.cart.reduce((a,b)=>a+(b.qty||1),0);
  const wishCount = state.wish.length;
  const cc = qs("#cartCount"); if(cc) cc.textContent = cartCount;
  const wc = qs("#wishCount"); if(wc) wc.textContent = wishCount;
}

function productCard(item){
  const tagClass = item.grade==="medigrade" ? "green" : item.grade==="premium" ? "blue" : "amber";
  const origin = item.origin ? `· ${item.origin}` : "";
  return `
  <article class="tile reveal">
    <img src="${item.img || "./assets/col-premium.jpg"}" alt="${item.name}"/>
    <div class="pad">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <span class="tag ${tagClass}">${gradeLabel(item.grade)}</span>
        <button class="iconbtn" data-wish="${item.id}" aria-label="Wishlist">♡</button>
      </div>
      <h3 style="margin:10px 0 6px; letter-spacing:-.01em">${item.name}</h3>
      <div class="small">${item.type ? item.type : ""} ${origin}</div>
      <div style="display:flex; justify-content:space-between; align-items:end; gap:10px; margin-top:10px">
        <div class="price">₹ ${fmt(item.price)} <span class="small">${item.unit||""}</span></div>
      </div>
      ${item.note ? `<div class="small" style="margin-top:6px">${item.note}</div>` : ""}
      <hr class="sep"/>
      <div class="actions">
        <button class="btn dark magnetic" data-buy="${item.id}">Buy</button>
        <button class="btn magnetic" data-add="${item.id}">Add to Cart</button>
      </div>
    </div>
  </article>`;
}

function toggleWish(id){ const i=state.wish.indexOf(id); if(i>=0) state.wish.splice(i,1); else state.wish.push(id); save(); }
function addToCart(id){ const it=state.cart.find(x=>x.id===id); if(it) it.qty+=1; else state.cart.push({id,qty:1}); save(); renderCart(); openDrawer("cart"); }
function removeFromCart(id){ state.cart = state.cart.filter(x=>x.id!==id); save(); renderCart(); }
function setQty(id, qty){ const it=state.cart.find(x=>x.id===id); if(!it) return; it.qty = Math.max(1, qty); save(); renderCart(); }

function wireCardActions(root=document){
  qsa("button[data-add]", root).forEach(b=>b.addEventListener("click", ()=>addToCart(b.dataset.add)));
  qsa("button[data-buy]", root).forEach(b=>b.addEventListener("click", ()=>{
    const item = state.catalog.find(x=>x.id===b.dataset.buy); if(!item) return;
    const msg = `Hi Fruit Story, I want to order:\n${item.name}\nGrade: ${gradeLabel(item.grade)}\nPlease confirm availability & price.`;
    window.open(waLink(msg), "_blank");
  }));
  qsa("button[data-wish]", root).forEach(b=>b.addEventListener("click", ()=>toggleWish(b.dataset.wish)));
}

function renderCart(){
  const wrap = qs("#cartItems"), empty = qs("#cartEmpty"), subtotalEl = qs("#cartSubtotal");
  if(!wrap) return;
  if(!state.cart.length){
    wrap.innerHTML = ""; if(empty) empty.style.display="block"; if(subtotalEl) subtotalEl.textContent="₹ 0"; return;
  }
  if(empty) empty.style.display="none";
  const byId = Object.fromEntries(state.catalog.map(x=>[x.id,x]));
  let subtotal=0;
  wrap.innerHTML = state.cart.map(ci=>{
    const p = byId[ci.id]; if(!p) return "";
    subtotal += (Number(p.price)||0) * (ci.qty||1);
    return `
    <div class="tile" style="box-shadow:none; margin-bottom:10px">
      <div class="pad" style="display:flex; gap:12px; align-items:center">
        <div style="width:64px; height:64px; border-radius:16px; overflow:hidden; border:1px solid var(--line)">
          <img src="${p.img || "./assets/col-premium.jpg"}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover"/>
        </div>
        <div style="flex:1">
          <b>${p.name}</b>
          <div class="small">${gradeLabel(p.grade)} · ₹ ${fmt(p.price)} ${p.unit||""}</div>
          <div style="display:flex; gap:10px; align-items:center; margin-top:8px">
            <button class="iconbtn" data-dec="${p.id}">−</button>
            <b>${ci.qty}</b>
            <button class="iconbtn" data-inc="${p.id}">+</button>
            <button class="btn" data-remove="${p.id}">Remove</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join("");
  if(subtotalEl) subtotalEl.textContent = `₹ ${fmt(subtotal)}`;
  qsa("[data-inc]", wrap).forEach(b=>b.addEventListener("click", ()=>setQty(b.dataset.inc, (state.cart.find(x=>x.id===b.dataset.inc)?.qty||1)+1)));
  qsa("[data-dec]", wrap).forEach(b=>b.addEventListener("click", ()=>setQty(b.dataset.dec, (state.cart.find(x=>x.id===b.dataset.dec)?.qty||1)-1)));
  qsa("[data-remove]", wrap).forEach(b=>b.addEventListener("click", ()=>removeFromCart(b.dataset.remove)));
}

function renderAnnouncements(){
  const bar = qs("#announceBar"); if(!bar) return;
  const items = state.site?.announcement || [];
  bar.innerHTML = items.map(t=>`<span class="pill"><span class="dot"></span>${t}</span>`).join("");
}
function setupMarquee(){
  const bar = qs("#announceBar"); if(!bar) return;
  const pills = Array.from(bar.querySelectorAll(".pill")); if(!pills.length) return;
  const wrap = document.createElement("div"); wrap.className="marquee";
  pills.forEach(p=>wrap.appendChild(p)); pills.forEach(p=>wrap.appendChild(p.cloneNode(true)));
  bar.innerHTML=""; bar.appendChild(wrap);
}
function setupReveal(){
  const els = Array.from(document.querySelectorAll(".reveal, .stagger"));
  if(!("IntersectionObserver" in window)){ els.forEach(el=>el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {threshold:0.12, rootMargin:"0px 0px -10% 0px"});
  els.forEach(el=>io.observe(el));
}
function setupMagneticButtons(){
  const btns = Array.from(document.querySelectorAll(".magnetic"));
  btns.forEach(btn=>{
    btn.addEventListener("mousemove", (e)=>{
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / r.width;
      const dy = (e.clientY - (r.top + r.height/2)) / r.height;
      btn.style.transform = `translate(${dx*6}px, ${dy*6}px)`;
    });
    btn.addEventListener("mouseleave", ()=>btn.style.transform="");
  });
}
function setupCursorGlow(){
  if(window.matchMedia("(pointer: coarse)").matches) return;
  const g = document.createElement("div"); g.className="cursorGlow"; document.body.appendChild(g);
  let raf=null;
  window.addEventListener("mousemove",(e)=>{
    if(!raf){
      raf=requestAnimationFrame(()=>{
        g.classList.add("on"); g.style.left=e.clientX+"px"; g.style.top=e.clientY+"px"; raf=null;
      });
    }
  });
  window.addEventListener("mouseleave", ()=>g.classList.remove("on"));
}

function openDrawer(which){
  const overlay = qs("#overlay");
  const drawers = {search: qs("#searchDrawer"), cart: qs("#cartDrawer")};
  Object.values(drawers).forEach(d=>d && d.classList.remove("show"));
  const d = drawers[which]; if(d) d.classList.add("show");
  if(overlay){ overlay.classList.add("show"); overlay.onclick = closeDrawers; }
}
function closeDrawers(){
  const overlay = qs("#overlay");
  qsa(".drawer.show").forEach(d=>d.classList.remove("show"));
  if(overlay){ overlay.classList.remove("show"); overlay.onclick=null; }
}

function wire(){
  qs("#btnSearch")?.addEventListener("click", ()=>openDrawer("search"));
  qs("#closeSearch")?.addEventListener("click", closeDrawers);
  qs("#btnCart")?.addEventListener("click", ()=>{ renderCart(); openDrawer("cart"); });
  qs("#closeCart")?.addEventListener("click", closeDrawers);
  window.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeDrawers(); });
  qs("#btnCheckout")?.addEventListener("click", ()=>{
    if(!state.cart.length) return;
    const byId = Object.fromEntries(state.catalog.map(x=>[x.id,x]));
    const lines = state.cart.map(ci=>{
      const p = byId[ci.id]; return p ? `• ${p.name} (${gradeLabel(p.grade)}) x${ci.qty}` : "";
    }).filter(Boolean);
    const note = (qs("#cartNote")?.value || "").trim();
    const msg = `Hi Fruit Story, I want to order:\n${lines.join("\n")}\n\nNote: ${note || "-"}\nPlease confirm availability & delivery.`;
    window.open(waLink(msg), "_blank");
  });
}

async function load(){
  document.documentElement.classList.add("js");
  const [site, catalog] = await Promise.all([fetch(SITE_URL).then(r=>r.json()), fetch(CATALOG_URL).then(r=>r.json())]);
  state.site = site; state.catalog = catalog || [];
  window.state = state; window.productCard = productCard; window.addToCart = addToCart; window.toggleWish = toggleWish; window.gradeLabel = gradeLabel; window.waLink = waLink;

  renderAnnouncements(); setupMarquee(); renderBadges(); renderCart();

  const picks = qs("#picksGrid");
  if(picks){ picks.innerHTML = state.catalog.slice(0,8).map(productCard).join(""); wireCardActions(picks); }
  const all = qs("#productsGrid");
  if(all){ all.innerHTML = state.catalog.map(productCard).join(""); wireCardActions(all); }

  const input = qs("#searchInput");
  const results = qs("#searchResults");
  if(input && results){
    const render = (list)=>{ results.innerHTML = list.map(productCard).join(""); wireCardActions(results); };
    render(state.catalog.slice(0,6));
    input.addEventListener("input", ()=>{
      const q = input.value.trim().toLowerCase();
      if(!q) return render(state.catalog.slice(0,6));
      const hit = state.catalog.filter(x=>
        (x.name||"").toLowerCase().includes(q) ||
        (x.origin||"").toLowerCase().includes(q) ||
        (x.grade||"").toLowerCase().includes(q) ||
        (x.type||"").toLowerCase().includes(q)
      ).slice(0,12);
      render(hit);
    });
  }

  setupReveal(); setupMagneticButtons(); setupCursorGlow();
}

window.addEventListener("DOMContentLoaded", async ()=>{
  wire();
  try{ await load(); wireCardActions(document); }
  catch(err){
    console.error(err);
    const tip = document.createElement("div");
    tip.className="container";
    tip.innerHTML = `<div class="tile" style="margin:18px 0"><div class="pad">
      <b>Preview tip:</b> Your browser may block loading JSON on <code>file://</code>. Run:
      <code>python3 -m http.server 8000</code> and open <code>http://localhost:8000</code>.
    </div></div>`;
    document.body.prepend(tip);
  }
});
