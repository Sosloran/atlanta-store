/* AtlantaBot — chatbot de catálogo: busca prendas y precios por palabra clave */
(function(){
  "use strict";
  const $ = s => document.querySelector(s);
  const fmt = n => "RD$ " + n.toLocaleString("es-DO");
  const fab=$("#chat-fab"), panel=$("#chat-panel"), body=$("#chat-body"), input=$("#chat-input"), form=$("#chat-form");
  if(!fab) return;
  let open=false;
  fab.addEventListener("click",()=>{ open=!open; panel.classList.toggle("open",open); if(open){ input.focus(); } });
  $("#chat-close").addEventListener("click",()=>{ open=false; panel.classList.remove("open"); });

  function bubble(who,html){
    const d=document.createElement("div");
    d.className="bub "+who;
    const av=document.createElement("div"); av.className="av"; av.textContent=who==="bot"?"🗽":"🧑";
    const m=document.createElement("div"); m.className="msg"; m.innerHTML=html;
    d.appendChild(av); d.appendChild(m); body.appendChild(d); body.scrollTop=body.scrollHeight;
  }
  function addProduct(id){
    document.dispatchEvent(new CustomEvent("crema:add",{detail:id}));
  }
  function showProducts(list){
    if(!list.length){ bubble("bot","No encontré esa prenda. Prueba con: gorra, playera, pantalón, camisa, sudadera o el nombre de una colección (True Rabia, Orohena, FRAVIC…)."); return; }
    let html="Aquí tienes "+(list.length>3?3:list.length)+" opciones:<br>";
    list.slice(0,3).forEach(p=>{
      html+=`<div style="margin:.5em 0"><b>${p.name}</b> — <span class="price">${fmt(p.price)}</span> `+
            `<button class="btn btn-primary" style="padding:.3em .7em;font-size:.8rem" onclick="document.dispatchEvent(new CustomEvent('crema:add',{detail:${p.id}}))">Añadir</button></div>`;
    });
    bubble("bot",html);
  }
  function respond(text){
    const q=text.toLowerCase().trim();
    const P=window.CREMA_PRODUCTS||[];
    // saludos
    if(/hola|buenas|saludo|hey/.test(q)) return bubble("bot","¡Bienvenido al Norte! 🗽 Soy AtlantaBot. Pregúntame por cualquier prenda o precio. Ej: \"precio de gorra\" o \"ver playeras\".");
    if(/precio|cuanto|cuesta|vale|costo/.test(q)) return showProducts(P.filter(p=>p.name.toLowerCase().includes(q.replace(/[^a-záéíóúñ ]/g,"").replace(/(precio|cuanto|cuesta|vale|costo|de|la|el)/g,"").trim())||q));
    if(/gorra|sombrero|cap/.test(q)) return showProducts(P.filter(p=>/gorra/i.test(p.catLabel)));
    if(/playera|camiseta|shirt|player/.test(q)) return showProducts(P.filter(p=>/playeras/i.test(p.catLabel)));
    if(/camisa/.test(q)) return showProducts(P.filter(p=>/camisas/i.test(p.catLabel)));
    if(/pantalon|jean|pants|bermuda/.test(q)) return showProducts(P.filter(p=>/pantalones/i.test(p.catLabel)));
    if(/sudadera|hoodie|jogger/.test(q)) return showProducts(P.filter(p=>/sudaderas/i.test(p.catLabel)));
    if(/coleccion|pack|combo|conjunto/.test(q)) return showProducts(P.filter(p=>/colecciones/i.test(p.catLabel)));
    if(/envio|delivery|reparto|zona/.test(q)) return bubble("bot","Hacemos <b>delivery</b> en La Romana y retiro en tienda. Elige tu opción en el carrito al hacer el pedido por WhatsApp. 📦");
    if(/whatsapp|contacto|pedir|orden|comprar|compro/.test(q)) return bubble("bot",'Escribe tu pedido y te llevo al WhatsApp de ventas: <a href="https://wa.me/message/SRDUJGXYN6LCE1" target="_blank">chatear con Atlanta Store 🗽</a>.');
    if(/categoria|ver todo|catalogo|tienda/.test(q)) return bubble("bot",'Tenemos: <span class="chip">Gorras</span><span class="chip">Camisas</span><span class="chip">Playeras</span><span class="chip">Pantalones</span><span class="chip">Sudaderas</span><span class="chip">Colecciones</span>. ¿Por cuál quieres ver prendas?');
    if(/quien|tienda|boutique|nombre|atlanta/.test(q)) return bubble("bot","Somos <b>Atlanta Store Romana</b> 🗽 — ropa urbana al Norte. 32.4k seguidores en Instagram. Pide por WhatsApp y recibe en casa.");
    if(/gracias|excelente|genial|ok|perfecto/.test(q)) return bubble("bot","¡Al Norte con estilo! 🔥 Cualquier otra prenda, dímelo.");
    // búsqueda libre
    const hits=P.filter(p=>p.name.toLowerCase().includes(q)||p.catLabel.toLowerCase().includes(q));
    if(hits.length) return showProducts(hits);
    return bubble("bot","No tengo eso todavía. Prueba: gorra, playera, camisa, pantalón, sudadera o una colección (True Rabia, Orohena, FRAVIC, Big Boss, WAIMEA, Majestik, Yiah Wear).");
  }
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const v=input.value.trim(); if(!v) return;
    const d=document.createElement("div"); d.className="bub user";
    d.innerHTML='<div class="av">🧑</div><div class="msg">'+v.replace(/</g,"&lt;")+'</div>';
    body.appendChild(d); body.scrollTop=body.scrollHeight; input.value="";
    setTimeout(()=>respond(v),350);
  });
  // saludo inicial
  bubble("bot","¡Bienvenido al Norte! 🗽 Soy AtlantaBot. Pregúntame por cualquier prenda o precio. Ej: <i>\"precio de gorra\"</i> o <i>\"ver playeras\"</i>.");
})();
