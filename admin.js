const STORE_KEY = "locker_catalog_admin_items";

let draftItems = [];

function setYear() {
  document.querySelectorAll("#year").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

function safeText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showMessage(text) {
  const message = document.getElementById("adminMessage");
  if (message) {
    message.textContent = text;
  }
}

function saveDraftToStorage() {
  localStorage.setItem(STORE_KEY, JSON.stringify(draftItems));
}

function loadDraftFromStorage() {
  const saved = localStorage.getItem(STORE_KEY);
  if (!saved) {
    return false;
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      draftItems = parsed;
      return true;
    }
  } catch (error) {
    console.warn("Could not parse saved draft", error);
  }

  return false;
}

async function loadItemsFromSite() {
  const response = await fetch(`data/items.json?ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("items.json is not an array");
  }

  draftItems = payload;
  saveDraftToStorage();
}

function renderItems() {
  const container = document.getElementById("itemList");
  const count = document.getElementById("itemCount");

  if (!container || !count) {
    return;
  }

  count.textContent = String(draftItems.length);

  if (!draftItems.length) {
    container.innerHTML = '<p class="admin-empty">No draft items yet.</p>';
    return;
  }

  container.innerHTML = draftItems
    .map((item, index) => {
      const title = safeText(item.title || "Untitled Item");
      const price = safeText(item.price || "Call for price");
      const category = safeText(item.category || "General");
      const condition = safeText(item.condition || "As-is");
      const status = safeText(item.status || "Available");
      const note = safeText(item.note || "");
      const image = typeof item.image === "string" ? item.image.trim() : "";
      const label = safeText(item.mediaLabel || item.title || "Item Photo");

      const media = image
        ? `<img src="${safeText(image)}" alt="${title}" loading="lazy">`
        : label;

      return `
        <article class="admin-item" data-index="${index}">
          <div class="admin-item-media">${media}</div>
          <div class="admin-item-body">
            <h3>${title}</h3>
            <p class="admin-item-price">${price}</p>
            <p class="admin-item-meta">${category} | ${condition} | ${status}</p>
            <p class="admin-item-note">${note}</p>
            <button type="button" class="remove-btn" data-remove="${index}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function addItemFromForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const title = String(formData.get("title") || "").trim();
  const price = String(formData.get("price") || "").trim();

  if (!title || !price) {
    showMessage("Title and price are required.");
    return;
  }

  const item = {
    title,
    price,
    category: String(formData.get("category") || "General").trim() || "General",
    condition: String(formData.get("condition") || "As-is").trim() || "As-is",
    status: String(formData.get("status") || "Available").trim() || "Available",
    note: String(formData.get("note") || "").trim(),
    mediaLabel: String(formData.get("mediaLabel") || title).trim() || title,
    image: String(formData.get("image") || "").trim()
  };

  draftItems.unshift(item);
  saveDraftToStorage();
  renderItems();
  showMessage(`Added "${title}" to draft.`);
  form.reset();

  const statusInput = document.getElementById("status");
  if (statusInput) {
    statusInput.value = "Available";
  }
}

function removeItem(index) {
  if (!Number.isInteger(index) || index < 0 || index >= draftItems.length) {
    return;
  }

  const [removed] = draftItems.splice(index, 1);
  saveDraftToStorage();
  renderItems();
  showMessage(`Removed "${removed.title || "item"}".`);
}

function downloadDraftJson() {
  const output = JSON.stringify(draftItems, null, 2);
  const blob = new Blob([output], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "items.json";
  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  showMessage("Downloaded items.json. Replace data/items.json in the repo, then git push.");
}

function bindEvents() {
  const form = document.getElementById("itemForm");
  const list = document.getElementById("itemList");
  const downloadBtn = document.getElementById("downloadBtn");
  const reloadBtn = document.getElementById("reloadBtn");

  if (form) {
    form.addEventListener("submit", addItemFromForm);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadDraftJson);
  }

  if (reloadBtn) {
    reloadBtn.addEventListener("click", async () => {
      try {
        await loadItemsFromSite();
        renderItems();
        showMessage("Reloaded draft from live data/items.json.");
      } catch (error) {
        showMessage("Could not reload from site. Try again in a moment.");
      }
    });
  }

  if (list) {
    list.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const value = target.getAttribute("data-remove");
      if (value === null) {
        return;
      }

      removeItem(Number(value));
    });
  }
}

async function initAdmin() {
  setYear();
  setActiveNavLink();
  bindEvents();

  const restored = loadDraftFromStorage();
  if (restored) {
    renderItems();
    showMessage("Loaded saved draft from this browser.");
    return;
  }

  try {
    await loadItemsFromSite();
    renderItems();
    showMessage("Loaded current items from data/items.json.");
  } catch (error) {
    draftItems = [];
    renderItems();
    showMessage("Could not load data/items.json. Start by adding an item.");
  }
}

initAdmin();
