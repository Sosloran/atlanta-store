/* Atlanta Store — app.js: carrito, whatsapp, personalización, UI */
(function(){
  "use strict";
  const $ = s => document.querySelector(s);
  const WA = "https://wa.me/message/SRDUJGXYN6LCE1"; // WhatsApp real de Atlanta Store
  const fmt = n => "RD$ " + n.toLocaleString("es-DO");

  // ---- toast ----
  function toast(msg){
    const t=$("#toast"); if(!t) return;
    t.textContent=msg; t.classList.add("show");
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2600);
  }
  const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  // ---- catálogo ----
  let CATALOG=[];
  try{ CATALOG = JSON.parse(document.getElementById("catalog-data").textContent); }catch(e){ CATALOG=[]; }
  window.CREMA_PRODUCTS = CATALOG; // expuesto para chatbot

  // ---- carrito ----
  let cart = JSON.parse(localStorage.getItem("atlanta_cart")||"[]");
  function save(){ localStorage.setItem("atlanta_cart", JSON.stringify(cart)); renderCart(); renderFab(); }
  function addToCart(id){
    const p = CATALOG.find(x=>x.id===id); if(!p) return;
    const it = cart.find(x=>x.id===id);
    if(it) it.qty++; else cart.push({id, qty:1});
    save(); toast("Añadido: "+p.name);
    document.dispatchEvent(new CustomEvent("crema:added",{detail:id}));
  }
  function changeQty(id,d){
    const it=cart.find(x=>x.id===id); if(!it) return;
    it.qty+=d; if(it.qty<=0) cart=cart.filter(x=>x.id!==id);
    save();
  }
  function cartTotal(){ return cart.reduce((s,x)=>{const p=CATALOG.find(y=>y.id===x.id);return s+(p?p.price*x.qty:0);},0); }
  function cartCount(){ return cart.reduce((s,x)=>s+x.qty,0); }

  function renderFab(){
    const c=$("#cart-count2"); if(c) c.textContent=cartCount();
    const c1=$("#cart-count1"); if(c1) c1.textContent=cartCount();
  }
  function renderCart(){
    const box=$("#cart-items"); if(!box) return;
    if(!cart.length){ box.innerHTML='<p class="muted" style="text-align:center;padding:2rem 0">Tu bolsa está vacía.</p>'; }
    else{
      box.innerHTML = cart.map(x=>{
        const p=CATALOG.find(y=>y.id===x.id); if(!p) return "";
        const emoji = (p.cat==="Gorras")?"🧢":(p.cat==="Pantalones")?"👖":(p.cat==="Camisas")?"👔":(p.cat==="Playeras")?"👕":(p.cat==="Sudaderas")?"🧥":"🛍️";
        return `<div class="cart-item">
          <div class="ci-emoji">${emoji}</div>
          <div>
            <div class="ci-name">${esc(p.name)}</div>
            <div class="ci-price">${fmt(p.price)}</div>
          </div>
          <div class="ci-qty">
            <button data-dec="${p.id}">−</button>
            <span>${x.qty}</span>
            <button data-inc="${p.id}">+</button>
          </div>
        </div>`;
      }).join("");
    }
    const t=$("#cart-total"); if(t) t.textContent=fmt(cartTotal());
  }

  function openCart(){ $("#cart-panel").classList.add("open"); }
  function closeCart(){ $("#cart-panel").classList.remove("open"); }

  function sendWhatsApp(){
    if(!cart.length){ toast("Añade productos primero"); return; }
    const mode = ($('input[name="delivery"]:checked')||{}).value || "pickup";
    const zone = ($("#zone")||{}).value || "";
    let lines = "*Pedido Atlanta Store Romana* 🗽\n";
    lines += "─".repeat(20)+"\n";
    cart.forEach(x=>{
      const p=CATALOG.find(y=>y.id===x.id);
      if(p) lines += `• ${p.name} x${x.qty} = ${fmt(p.price*x.qty)}\n`;
    });
    lines += "─".repeat(20)+"\n";
    lines += `*Total:* ${fmt(cartTotal())}\n`;
    lines += `*Entrega:* ${mode==="delivery" ? "Delivery"+(zone?" ("+zone+")":"") : "Recoger en tienda"}\n`;
    const note=($("#order-note")||{}).value;
    if(note) lines += `*Nota:* ${note}\n`;
    lines += "\n¡Gracias por comprar al Norte! 🔥";
    window.open(WA+"?text="+encodeURIComponent(lines),"_blank");
  }

  // ---- render productos ----
  function renderProducts(list){
    const grid=$("#product-grid"); if(!grid) return;
    if(!list.length){ grid.innerHTML='<p class="muted" style="grid-column:1/-1;text-align:center;padding:2rem">Sin resultados.</p>'; return; }
    grid.innerHTML = list.map(p=>{
      const emoji = (p.cat==="Gorras")?"🧢":(p.cat==="Pantalones")?"👖":(p.cat==="Camisas")?"👔":(p.cat==="Playeras")?"👕":(p.cat==="Sudaderas")?"🧥":"🛍️";
      const cls = (p.cat==="Pantalones")?"pants":(p.cat==="Camisas"||p.cat==="Playeras")?"shirt":"";
      return `<article class="product-card">
        <div class="product-media ${cls}">${emoji}</div>
        <div class="product-body">
          <div class="product-cat">${p.catLabel}</div>
          <div class="product-name">${esc(p.name)}</div>
          <div class="product-desc">${esc(p.desc||"")}</div>
          <div class="product-price">${fmt(p.price)}</div>
          <button class="btn btn-primary" data-add="${p.id}">Añadir a bolsa 🛍️</button>
        </div>
      </article>`;
    }).join("");
  }

  // ---- filtros / búsqueda ----
  let activeCat="all", query="";
  function applyFilters(){
    let list = CATALOG.slice();
    if(activeCat!=="all") list=list.filter(p=>p.catLabel===activeCat);
    if(query) list=list.filter(p=>p.name.toLowerCase().includes(query));
    renderProducts(list);
  }
  function setCats(){
    const f=$("#filters"); if(!f) return;
    const cats=["all",...Array.from(new Set(CATALOG.map(p=>p.catLabel)))];
    f.innerHTML=cats.map(c=>`<button data-cat="${c}" class="${c==="all"?"active":""}">${c==="all"?"Todo":c}</button>`).join("");
  }

  // ---- init común ----
  function initCommon(){
    renderFab(); renderCart(); setCats();
    document.addEventListener("crema:add", e=>{ if(e.detail) addToCart(e.detail); });
    // carrito fab
    const fab=$("#cart-fab"); if(fab) fab.addEventListener("click",openCart);
    const close=$("#cart-close"); if(close) close.addEventListener("click",closeCart);
    const back=$("#cart-backdrop"); if(back) back.addEventListener("click",closeCart);
    const send=$("#cart-send"); if(send) send.addEventListener("click",sendWhatsApp);
    // delegación add/qty
    document.addEventListener("click",e=>{
      const add=e.target.closest("[data-add]");
      if(add){ addToCart(parseInt(add.dataset.add,10)); return; }
      const inc=e.target.closest("[data-inc]");
      if(inc){ changeQty(parseInt(inc.dataset.inc,10),1); return; }
      const dec=e.target.closest("[data-dec]");
      if(dec){ changeQty(parseInt(dec.dataset.dec,10),-1); return; }
      const cat=e.target.closest("[data-cat]");
      if(cat){ document.querySelectorAll("#filters button").forEach(b=>b.classList.remove("active")); cat.classList.add("active"); activeCat=cat.dataset.cat; applyFilters(); }
    });
    const search=$("#search"); if(search) search.addEventListener("input",()=>{ query=search.value.toLowerCase().trim(); applyFilters(); });
    const y=$("#year"); if(y) y.textContent=new Date().getFullYear();
  }

  // ---- páginas ----
  function isCatalog(){ return !!$("#product-grid"); }
  function initCatalog(){ applyFilters(); }

  // arranque
  if(document.readyState!=="loading"){ initCommon(); if(isCatalog()) initCatalog(); }
  else document.addEventListener("DOMContentLoaded",()=>{ initCommon(); if(isCatalog()) initCatalog(); });
})();
