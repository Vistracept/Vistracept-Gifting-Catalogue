let PRODUCTS = [];
let CATEGORIES = [];
let searchTerm = "";
let enquiryList = JSON.parse(localStorage.getItem("vc_enquiry") || "[]");

const app = document.getElementById("app");

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}

function saveEnquiry() {
  localStorage.setItem("vc_enquiry", JSON.stringify(enquiryList));
  renderFloatingButton();
}

function toggleEnquiry(id) {
  const i = enquiryList.indexOf(id);
  if (i === -1) enquiryList.push(id); else enquiryList.splice(i, 1);
  saveEnquiry();
}

function renderFloatingButton() {
  const btn = document.getElementById("floatingEnquiry");
  if (!btn) return;
  if (enquiryList.length === 0) { btn.hidden = true; return; }
  btn.hidden = false;
  btn.textContent = `\u2606 My List (${enquiryList.length})`;
}

/* ---------------- Routing ---------------- */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, "");
  const parts = h.split("/").filter(Boolean).map(decodeURIComponent);
  return parts; // [] = home, ["products"], ["products", cat], ["products", cat, group], ["contact"]
}

function navigate(path) {
  searchTerm = "";
  location.hash = "#/" + path.map(encodeURIComponent).join("/");
}

window.addEventListener("hashchange", render);

/* ---------------- Shared bits ---------------- */
function navHtml(active) {
  const items = [
    ["Home", "", ""],
    ["Products", "products", "products"],
    ["Contact", "contact", "contact"],
  ];
  return items.map(([label, path, key]) => {
    const isActive = key === active;
    return `<button class="nav-link ${isActive ? "active" : ""}" data-nav="${path}">${label}</button>`;
  }).join("");
}

function header(active) {
  return `
    <header class="site-header">
      <div class="header-inner">
        <img src="images/logo-mark.png" alt="Vistracept &mdash; Home" class="logo-mark" data-nav="" title="Home">
        <nav class="main-nav">${navHtml(active)}</nav>
        <button class="enquiry-pill" data-nav="contact">My List (${enquiryList.length})</button>
      </div>
    </header>`;
}

function footerHtml() {
  return `
    <footer>
      <img src="images/logo-tagline.png" alt="Vistracept &mdash; Gifts that delight. Make your brand memorable." class="logo-tagline">
      <div>&copy; ${new Date().getFullYear()} Vistracept &mdash; Visibility | Strategy | Concept</div>
    </footer>`;
}

function pageBand({ crumbs, title, sub }) {
  const crumbHtml = crumbs.map((c, i) => {
    const isLast = i === crumbs.length - 1;
    const sep = i > 0 ? `<span class="sep">/</span>` : "";
    if (isLast) return `${sep}<span>${escapeHtml(c.label)}</span>`;
    return `${sep}<button data-path="${c.path.join("/")}">${escapeHtml(c.label)}</button>`;
  }).join("");
  return `
    <div class="page-band">
      <img src="images/ribbon-strip.jpg" alt="">
      <div class="band-overlay"></div>
      <div class="band-inner">
        <div class="breadcrumb">${crumbHtml}</div>
        ${sub ? `<div class="sub">${escapeHtml(sub)}</div>` : ""}
        <h1>${escapeHtml(title)}</h1>
      </div>
    </div>`;
}

/* ---------------- Product card / tiles ---------------- */
function badgesHtml(p) {
  const isNew = p.badges && p.badges.some(b => /new/i.test(b));
  return isNew ? `<span class="badge">New</span>` : "";
}

function cardHtml(p) {
  const inList = enquiryList.includes(p.id);
  return `
    <div class="card" data-open="${p.id}">
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${escapeHtml(p.name)}">
        <div class="badge-row">
          <span class="serial-badge">${p.serial}</span>
          ${badgesHtml(p)}
        </div>
      </div>
      <div class="card-body">
        <div class="card-tag">${escapeHtml(p.tag)}</div>
        <div class="card-name">${escapeHtml(p.name)}</div>
        <div class="card-cat">${escapeHtml(p.category)} &middot; ${escapeHtml(p.subgroup)}</div>
        <div class="card-actions">
          <span></span>
          <button class="add-btn ${inList ? "added" : ""}" data-add="${p.id}">${inList ? "\u2713 Added" : "+ Add to list"}</button>
        </div>
      </div>
    </div>`;
}

function tileHtml(img, name, count, dataAttr) {
  return `
    <div class="tile" ${dataAttr}>
      <div class="tile-img-wrap"><img src="${img}" alt="${escapeHtml(name)}"></div>
      <div class="tile-body">
        <div class="tile-name">${escapeHtml(name)}</div>
        <div class="tile-count">${count} product${count === 1 ? "" : "s"}</div>
      </div>
    </div>`;
}

/* ---------------- Pages ---------------- */
function renderHome() {
  const catTiles = CATEGORIES.map(c =>
    tileHtml(c.cover, c.name, c.count, `data-path="products/${escapeHtml(c.name)}"`)
  ).join("");

  app.innerHTML = `
    ${header("")}
    <div class="hero-banner">
      <img src="images/hero.jpg" alt="Vistracept &mdash; Gifts that delight. Make your brand memorable.">
    </div>
    <div class="hero-cta-bar">
      <button class="btn btn-gold" data-path="products">Browse Products</button>
      <button class="btn btn-outline" data-path="contact">Contact Us</button>
    </div>
    <div class="home-section">
      <h2>Corporate Gifting Catalogue 2026&ndash;27</h2>
      <p class="lead">Glassware, opalware and thermoware gift sets, plus bed linen, bath linen and top-of-bed textiles. Every product carries a reference number &mdash; browse, add the ones you like to your list, and send it to us.</p>
      <div class="tri-grid">${catTiles}</div>
    </div>
    ${footerHtml()}
    <button class="floating-enquiry" id="floatingEnquiry" data-path="contact" hidden></button>
  `;
  bindGlobal();
  renderFloatingButton();
}

function renderProductsRoot() {
  const catTiles = CATEGORIES.map(c =>
    tileHtml(c.cover, c.name, c.count, `data-path="products/${escapeHtml(c.name)}"`)
  ).join("");

  app.innerHTML = `
    ${header("products")}
    ${pageBand({ crumbs: [{ label: "Products", path: ["products"] }], title: "All Categories", sub: `${PRODUCTS.length} products` })}
    <main>
      ${searchBoxHtml()}
      <div id="searchResults"></div>
      <div class="grid">${catTiles}</div>
    </main>
    ${footerHtml()}
    <button class="floating-enquiry" id="floatingEnquiry" data-path="contact" hidden></button>
  `;
  bindGlobal();
  bindSearch(null, null);
  renderFloatingButton();
}

function renderCategory(catName) {
  const cat = CATEGORIES.find(c => c.name === catName);
  if (!cat) { navigate(["products"]); return; }
  const groupTiles = cat.groups.map(g =>
    tileHtml(g.cover, g.name, g.count, `data-path="products/${escapeHtml(catName)}/${escapeHtml(g.name)}"`)
  ).join("");

  app.innerHTML = `
    ${header("products")}
    ${pageBand({
      crumbs: [{ label: "Products", path: ["products"] }, { label: catName, path: ["products", catName] }],
      title: catName, sub: `${cat.count} products across ${cat.groups.length} groups`
    })}
    <main>
      ${searchBoxHtml()}
      <div id="searchResults"></div>
      <div class="grid">${groupTiles}</div>
    </main>
    ${footerHtml()}
    <button class="floating-enquiry" id="floatingEnquiry" data-path="contact" hidden></button>
  `;
  bindGlobal();
  bindSearch(catName, null);
  renderFloatingButton();
}

function renderSubgroup(catName, groupName) {
  const items = PRODUCTS.filter(p => p.category === catName && p.subgroup === groupName);
  if (items.length === 0) { navigate(["products", catName]); return; }

  app.innerHTML = `
    ${header("products")}
    ${pageBand({
      crumbs: [
        { label: "Products", path: ["products"] },
        { label: catName, path: ["products", catName] },
        { label: groupName, path: ["products", catName, groupName] },
      ],
      title: groupName, sub: catName
    })}
    <main>
      ${searchBoxHtml()}
      <div id="searchResults"></div>
      <div class="result-meta">${items.length} product${items.length === 1 ? "" : "s"}</div>
      <div class="grid" id="itemGrid">${items.map(cardHtml).join("")}</div>
    </main>
    ${footerHtml()}
    <button class="floating-enquiry" id="floatingEnquiry" data-path="contact" hidden></button>
  `;
  bindGlobal();
  bindCardEvents(document.getElementById("itemGrid"));
  bindSearch(catName, groupName);
  renderFloatingButton();
}

function searchBoxHtml() {
  return `
    <div class="search-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="searchInput" placeholder="Search all products&hellip;" autocomplete="off" value="${escapeHtml(searchTerm)}">
    </div>`;
}

function bindSearch(scopeCat, scopeGroup) {
  const input = document.getElementById("searchInput");
  const resultsEl = document.getElementById("searchResults");
  const gridEls = document.querySelectorAll("main > .grid");

  function run() {
    const term = input.value.trim().toLowerCase();
    searchTerm = input.value;
    if (!term) {
      resultsEl.innerHTML = "";
      resultsEl.style.display = "none";
      gridEls.forEach(g => g.style.display = "");
      const rm = document.querySelector(".result-meta");
      if (rm) rm.style.display = "";
      return;
    }
    gridEls.forEach(g => g.style.display = "none");
    const rm = document.querySelector(".result-meta");
    if (rm) rm.style.display = "none";

    let pool = PRODUCTS;
    if (scopeCat) pool = pool.filter(p => p.category === scopeCat);
    if (scopeGroup) pool = pool.filter(p => p.subgroup === scopeGroup);

    const matches = pool.filter(p =>
      `${p.name} ${p.tag} ${p.body} ${p.category} ${p.subgroup} ${p.serial}`.toLowerCase().includes(term)
    );

    resultsEl.style.display = "block";
    if (matches.length === 0) {
      resultsEl.innerHTML = `<div class="no-results">No products match &ldquo;${escapeHtml(searchTerm)}&rdquo;.</div>`;
      return;
    }
    resultsEl.innerHTML = `
      <div class="result-meta">${matches.length} result${matches.length === 1 ? "" : "s"} for &ldquo;${escapeHtml(searchTerm)}&rdquo;</div>
      <div class="grid">${matches.map(cardHtml).join("")}</div>`;
    bindCardEvents(resultsEl);
  }

  input.addEventListener("input", run);
  if (searchTerm) run();
}

function renderContact() {
  const items = enquiryList.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const listHtml = items.length ? items.map(p => `
      <div class="list-item">
        <span><span class="serial-badge">${p.serial}</span>${escapeHtml(p.name)}</span>
        <button class="rm-btn" data-rm="${p.id}" title="Remove">&times;</button>
      </div>`).join("")
    : `<div class="empty-list">Your list is empty. Browse the products and tap &ldquo;+ Add to list&rdquo; on anything you&rsquo;d like a quote for.</div>`;

  const serials = items.map(p => `${p.serial} \u2014 ${p.name}`).join("\n");
  const mailBody = encodeURIComponent(
    `Hello Vistracept,\n\nI'd like a quotation for the following items:\n\n${serials || "(add items from the catalogue first)"}\n\nCompany:\nQuantity needed:\nDelivery city:\n\nThanks,`
  );
  const mailto = `mailto:info@vistracept.com?subject=${encodeURIComponent("Gifting enquiry - Vistracept catalogue")}&body=${mailBody}`;

  app.innerHTML = `
    ${header("contact")}
    ${pageBand({ crumbs: [{ label: "Contact", path: ["contact"] }], title: "Contact Us", sub: "Let\u2019s plan your gifting range" })}
    <main>
      <div class="contact-grid">
        <div class="panel-box">
          <h3>Get in touch</h3>
          <div class="contact-row"><span class="label">Email</span><span><a href="mailto:info@vistracept.com">info@vistracept.com</a></span></div>
          <div class="contact-row"><span class="label">Phone</span><span><a href="tel:+919745175566">+91 97451 75566</a></span></div>
          <div class="contact-row"><span class="label">Regd. Off.</span><span>Door No. 40/2604/A4, Ventura, Anjumana, NH-66 Bye Pass, Ernakulam</span></div>
          <p style="color:var(--text-dim); font-size:13.5px; margin-top:16px;">
            Browse the <button data-path="products" style="background:none;border:none;color:var(--gold-bright);cursor:pointer;padding:0;font-weight:700;">Products</button>
            section, note the reference number on anything you like (or tap &ldquo;+ Add to list&rdquo;), and send it to us for a quotation.
          </p>
        </div>
        <div class="panel-box">
          <h3>Your list (${items.length})</h3>
          <div id="enquiryListBox">${listHtml}</div>
          <textarea class="msg-box" id="msgBox" readonly>${serials}</textarea>
          <div class="contact-actions">
            <a class="btn btn-gold" href="${items.length ? mailto : "#"}" ${items.length ? "" : "onclick=\"return false;\""}>Email this list</a>
            <button class="btn btn-outline" id="copyListBtn" ${items.length ? "" : "disabled"}>Copy list</button>
            <button class="btn btn-outline" id="clearListBtn" ${items.length ? "" : "disabled"}>Clear list</button>
          </div>
        </div>
      </div>
    </main>
    ${footerHtml()}
    <button class="floating-enquiry" id="floatingEnquiry" data-path="contact" hidden></button>
  `;
  bindGlobal();
  renderFloatingButton();

  document.querySelectorAll("[data-rm]").forEach(btn => {
    btn.addEventListener("click", () => { toggleEnquiry(btn.dataset.rm); renderContact(); });
  });
  const copyBtn = document.getElementById("copyListBtn");
  if (copyBtn) copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(serials).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => copyBtn.textContent = "Copy list", 1500);
    });
  });
  const clearBtn = document.getElementById("clearListBtn");
  if (clearBtn) clearBtn.addEventListener("click", () => {
    enquiryList = []; saveEnquiry(); renderContact();
  });
}

/* ---------------- Event binding ---------------- */
function bindGlobal() {
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.addEventListener("click", () => navigate(el.dataset.nav ? [el.dataset.nav] : []));
  });
  document.querySelectorAll("[data-path]").forEach(el => {
    el.addEventListener("click", (e) => {
      if (el.tagName === "A") return; // let real links behave normally
      navigate(el.dataset.path.split("/"));
    });
  });
}

function bindCardEvents(scope) {
  if (!scope) return;
  scope.querySelectorAll("[data-open]").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-add]")) return;
      openModal(card.dataset.open);
    });
  });
  scope.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleEnquiry(btn.dataset.add);
      const inList = enquiryList.includes(btn.dataset.add);
      btn.textContent = inList ? "\u2713 Added" : "+ Add to list";
      btn.classList.toggle("added", inList);
    });
  });
}

/* ---------------- Modal ---------------- */
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const overlay = document.getElementById("modalOverlay");
  const body = document.getElementById("modalBody");
  const inList = enquiryList.includes(p.id);
  body.innerHTML = `
    <div class="modal-img-wrap"><img src="${p.img}" alt="${escapeHtml(p.name)}"></div>
    <div class="modal-info">
      <button class="modal-close">&times;</button>
      <span class="serial-badge">${p.serial}</span>
      <div class="card-tag">${escapeHtml(p.tag)}</div>
      <h2>${escapeHtml(p.name)}</h2>
      <div class="modal-cat">${escapeHtml(p.category)} &middot; ${escapeHtml(p.subgroup)}</div>
      <div class="modal-badges">${badgesHtml(p)}</div>
      <div class="modal-body">${escapeHtml(p.body)}</div>
      <button class="modal-add ${inList ? "added" : ""}" id="modalAddBtn">${inList ? "\u2713 Added to your list" : "+ Add to your list"}</button>
      <div class="modal-enquire">Quote reference <strong>${p.serial}</strong> when you contact us for pricing, minimum order quantities and branding options.</div>
    </div>`;
  body.querySelector(".modal-close").addEventListener("click", closeModal);
  body.querySelector("#modalAddBtn").addEventListener("click", (e) => {
    toggleEnquiry(p.id);
    const nowIn = enquiryList.includes(p.id);
    e.target.textContent = nowIn ? "\u2713 Added to your list" : "+ Add to your list";
    e.target.classList.toggle("added", nowIn);
    // refresh underlying grid button too
    const gridBtn = document.querySelector(`[data-add="${p.id}"]`);
    if (gridBtn) {
      gridBtn.textContent = nowIn ? "\u2713 Added" : "+ Add to list";
      gridBtn.classList.toggle("added", nowIn);
    }
  });
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").hidden = true;
  document.body.style.overflow = "";
}

/* ---------------- Router dispatch ---------------- */
function render() {
  const parts = parseHash();
  if (parts.length === 0) return renderHome();
  if (parts[0] === "contact") return renderContact();
  if (parts[0] === "products") {
    if (parts.length === 1) return renderProductsRoot();
    if (parts.length === 2) return renderCategory(parts[1]);
    return renderSubgroup(parts[1], parts[2]);
  }
  renderHome();
}

/* ---------------- Boot ---------------- */
Promise.all([
  fetch("products.json").then(r => r.json()),
  fetch("categories.json").then(r => r.json()),
]).then(([products, categories]) => {
  PRODUCTS = products;
  CATEGORIES = categories;
  render();
}).catch(err => {
  app.innerHTML = `<div class="no-results">Could not load the catalogue data. ${escapeHtml(err.message || "")}</div>`;
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const overlay = document.getElementById("modalOverlay");
    if (overlay && !overlay.hidden) closeModal();
  }
});
document.addEventListener("click", e => {
  const overlay = document.getElementById("modalOverlay");
  if (overlay && !overlay.hidden && e.target === overlay) closeModal();
});
