const FALLBACK_ITEMS = [
  {
    title: "Vintage Oak Dresser",
    price: "$120",
    category: "Furniture",
    condition: "Good",
    status: "Available",
    note: "Solid wood, all drawers slide smoothly.",
    mediaLabel: "Oak Dresser",
    image: ""
  },
  {
    title: "DeWalt Drill Set",
    price: "$65",
    category: "Tools",
    condition: "Tested",
    status: "Available",
    note: "Includes charger, 2 batteries, and carrying case.",
    mediaLabel: "Drill Set",
    image: ""
  },
  {
    title: "Samsung 50\" TV",
    price: "$180",
    category: "Electronics",
    condition: "Tested",
    status: "Available",
    note: "Clear picture and sound. Includes remote.",
    mediaLabel: "50in TV",
    image: ""
  },
  {
    title: "Mid-Century Accent Chair",
    price: "$95",
    category: "Furniture",
    condition: "Great",
    status: "Available",
    note: "Clean fabric with minor wear on legs.",
    mediaLabel: "Accent Chair",
    image: ""
  },
  {
    title: "KitchenAid Mixer",
    price: "$140",
    category: "Household",
    condition: "Tested",
    status: "Available",
    note: "5-quart bowl included. Runs smoothly.",
    mediaLabel: "Mixer",
    image: ""
  },
  {
    title: "Comic Lot (50 issues)",
    price: "$75",
    category: "Collectibles",
    condition: "Mixed",
    status: "Available",
    note: "Bagged comics from multiple series.",
    mediaLabel: "Comic Lot",
    image: ""
  }
];

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    }
  });
}

function setYear() {
  document.querySelectorAll("#year").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadCatalogItems() {
  try {
    const response = await fetch(`data/items.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error("Catalog payload is not an array");
    }
    return payload;
  } catch (error) {
    console.warn("Failed to load data/items.json. Using fallback items.", error);
    return FALLBACK_ITEMS;
  }
}

function renderCatalog(items) {
  const grid = document.getElementById("catalogGrid");
  if (!grid) {
    return;
  }

  if (!items.length) {
    grid.innerHTML = `
      <article class="catalog-card">
        <div class="card-body">
          <h2 class="card-title">No items listed yet</h2>
          <p class="card-note">Check back soon for new inventory.</p>
        </div>
      </article>
    `;
    return;
  }

  const cards = items.map((item) => {
    const title = escapeHtml(item.title || "Untitled Item");
    const price = escapeHtml(item.price || "Call for price");
    const category = escapeHtml(item.category || "General");
    const condition = escapeHtml(item.condition || "As-is");
    const status = escapeHtml(item.status || "Available");
    const note = escapeHtml(item.note || "");
    const mediaLabel = escapeHtml(item.mediaLabel || item.title || "Item Photo");
    const image = typeof item.image === "string" ? item.image.trim() : "";

    const mediaMarkup = image
      ? `<img src="${escapeHtml(image)}" alt="${title}" loading="lazy">`
      : mediaLabel;

    return `
      <article class="catalog-card">
        <div class="card-media">${mediaMarkup}</div>
        <div class="card-body">
          <h2 class="card-title">${title}</h2>
          <p class="card-price">${price}</p>
          <div class="card-meta">
            <span class="pill">${category}</span>
            <span class="pill">${condition}</span>
            <span class="pill">${status}</span>
          </div>
          <p class="card-note">${note}</p>
        </div>
      </article>
    `;
  }).join("");

  grid.innerHTML = cards;
}

async function initCatalog() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) {
    return;
  }

  const items = await loadCatalogItems();
  renderCatalog(items);
}

setActiveNavLink();
setYear();
initCatalog();
