// ---- Site settings: change these once you pick a name/domain ----
const SITE = {
  name: "Bhoomi Realty",
  tagline: "Verified land details and handpicked properties.",
  phone: "+91 90000 00000",
  whatsapp: "919000000000",
  email: "hello@example.com",
  city: "Hyderabad",
};

const NAV = [
  ["index.html", "Home"],
  ["land.html", "Land Lookup"],
  ["properties.html", "Properties"],
];

const LOGO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M5 20V10l7-6 7 6v10"/><path d="M10 20v-5h4v5"/></svg>`;

const ICONS = {
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><circle cx="11" cy="14" r="2.5"/><path d="m13 16 2.5 2.5"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`,
};

function renderChrome() {
  // Cloudflare serves /land.html as /land, so compare without the extension
  const page = (href) => href.replace(/\.html$/, "") || "index";
  const here = page(location.pathname.split("/").pop());
  const header = document.getElementById("site-header");
  if (header) {
    header.classList.add("site-header");
    header.innerHTML = `
      <div class="container nav">
        <a class="logo" href="index.html"><span class="logo-mark">${LOGO_SVG}</span>${esc(SITE.name)}</a>
        <button class="menu-btn" aria-label="Menu" aria-expanded="false">☰</button>
        <ul class="nav-links">
          ${NAV.map(([href, label]) => `<li><a href="${href}" class="${here === page(href) ? "active" : ""}">${label}</a></li>`).join("")}
          <li><a href="requirement.html" class="nav-cta">Post Requirement</a></li>
        </ul>
      </div>`;
    const btn = header.querySelector(".menu-btn");
    const links = header.querySelector(".nav-links");
    btn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      header.classList.toggle("scrolled", open || scrollY > 10);
    });
    const onScroll = () => header.classList.toggle("scrolled", scrollY > 10 || links.classList.contains("open"));
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="logo" href="index.html"><span class="logo-mark">${LOGO_SVG}</span>${esc(SITE.name)}</a>
            <p style="max-width:340px;margin:0">${esc(SITE.tagline)} Serving buyers across ${esc(SITE.city)}.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="land.html">Land lookup</a></li>
              <li><a href="properties.html">Properties</a></li>
              <li><a href="requirement.html">Post requirement</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:${SITE.phone.replace(/\s/g, "")}">${esc(SITE.phone)}</a></li>
              <li><a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></li>
              <li><a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">© ${new Date().getFullYear()} ${esc(SITE.name)}. Land details are for reference; always verify with the Sub-Registrar Office before buying.</div>
      </div>`;
  }
  document.title = document.title.replace("{site}", SITE.name);
  initReveal();
}

// Fade elements with .reveal in as they scroll into view
let revealObserver;
function initReveal(root = document) {
  if (!("IntersectionObserver" in window)) {
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    return;
  }
  revealObserver ||= new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  root.querySelectorAll(".reveal:not(.in)").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    revealObserver.observe(el);
  });
}

// ---- Helpers ----
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Indian-style price: ₹45 L, ₹1.25 Cr
function formatPrice(n) {
  if (n == null) return "—";
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} L`;
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function formatSize(size, unit) {
  return size == null ? "" : `${Number(size).toLocaleString("en-IN")} ${unit || ""}`.trim();
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { "content-type": "application/json", ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function showAlert(el, msg, ok = true) {
  el.className = `alert ${ok ? "alert-ok" : "alert-err"}`;
  el.textContent = msg;
}

function propertyCard(p) {
  return `
    <a class="prop-card reveal" href="property.html?id=${p.id}">
      <div class="prop-img">
        ${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.title)}" loading="lazy">` : ""}
        <span class="badge">${esc(p.type)}</span>
        ${p.doc_number ? `<span class="badge badge-verified">✓ Doc linked</span>` : ""}
        <span class="prop-price-tag">${formatPrice(p.price)}</span>
      </div>
      <div class="prop-body">
        <div class="prop-title">${esc(p.title)}</div>
        <div class="prop-meta">
          <span>📍 ${esc(p.area)}, ${esc(p.city)}</span>
          ${p.size ? `<span>📐 ${formatSize(p.size, p.size_unit)}</span>` : ""}
        </div>
      </div>
    </a>`;
}

function skeletons(n = 3) {
  return Array.from({ length: n }, () => `<div class="skeleton"></div>`).join("");
}

function emptyState(icon, msg) {
  return `<div class="empty"><div class="big">${icon}</div>${msg}</div>`;
}

// Budget dropdown options shared by forms
const BUDGETS = [
  [1000000, "₹10 L"], [2500000, "₹25 L"], [5000000, "₹50 L"], [7500000, "₹75 L"],
  [10000000, "₹1 Cr"], [20000000, "₹2 Cr"], [50000000, "₹5 Cr"], [100000000, "₹10 Cr"],
];
function budgetOptions(placeholder) {
  return `<option value="">${placeholder}</option>` + BUDGETS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
}

const TYPE_OPTIONS = `
  <option value="plot">Plot</option>
  <option value="agricultural">Agricultural land</option>
  <option value="house">Independent house</option>
  <option value="flat">Flat / Apartment</option>
  <option value="commercial">Commercial</option>`;

document.addEventListener("DOMContentLoaded", renderChrome);
