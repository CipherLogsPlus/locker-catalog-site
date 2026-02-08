const catalogItems = [
  {
    title: "Vintage Oak Dresser",
    price: "$120",
    category: "Furniture",
    condition: "Good",
    note: "Solid wood, all drawers slide smoothly.",
    mediaLabel: "Oak Dresser"
  },
  {
    title: "DeWalt Drill Set",
    price: "$65",
    category: "Tools",
    condition: "Tested",
    note: "Includes charger, 2 batteries, and carrying case.",
    mediaLabel: "Drill Set"
  },
  {
    title: "Samsung 50\" TV",
    price: "$180",
    category: "Electronics",
    condition: "Tested",
    note: "Clear picture and sound. Includes remote.",
    mediaLabel: "50in TV"
  },
  {
    title: "Mid-Century Accent Chair",
    price: "$95",
    category: "Furniture",
    condition: "Great",
    note: "Clean fabric with minor wear on legs.",
    mediaLabel: "Accent Chair"
  },
  {
    title: "KitchenAid Mixer",
    price: "$140",
    category: "Household",
    condition: "Tested",
    note: "5-quart bowl included. Runs smoothly.",
    mediaLabel: "Mixer"
  },
  {
    title: "Comic Lot (50 issues)",
    price: "$75",
    category: "Collectibles",
    condition: "Mixed",
    note: "Bagged comics from multiple series.",
    mediaLabel: "Comic Lot"
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

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) {
    return;
  }

  const cards = catalogItems
    .map((item) => {
      return `
        <article class="catalog-card">
          <div class="card-media">${item.mediaLabel}</div>
          <div class="card-body">
            <h2 class="card-title">${item.title}</h2>
            <p class="card-price">${item.price}</p>
            <div class="card-meta">
              <span class="pill">${item.category}</span>
              <span class="pill">${item.condition}</span>
              <span class="pill">Available</span>
            </div>
            <p class="card-note">${item.note}</p>
          </div>
        </article>
      `;
    })
    .join("");

  grid.innerHTML = cards;
}

setActiveNavLink();
setYear();
renderCatalog();
