const STORE_KEY = "locker_catalog_admin_items";
const PUBLISH_SETTINGS_KEY = "locker_catalog_publish_settings";
const PUBLISH_PATH = "data/items.json";

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

function deriveGitHubDefaults() {
  const hostname = window.location.hostname;
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (hostname.endsWith(".github.io")) {
    const owner = hostname.replace(".github.io", "");
    const repo = pathParts[0] || "locker-catalog-site";
    return { owner, repo, branch: "main" };
  }

  return {
    owner: "CipherLogsPlus",
    repo: "locker-catalog-site",
    branch: "main"
  };
}

function loadPublishSettings() {
  const defaults = deriveGitHubDefaults();
  const raw = localStorage.getItem(PUBLISH_SETTINGS_KEY);
  if (!raw) {
    return {
      owner: defaults.owner,
      repo: defaults.repo,
      branch: defaults.branch,
      token: "",
      rememberToken: false
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      owner: parsed.owner || defaults.owner,
      repo: parsed.repo || defaults.repo,
      branch: parsed.branch || defaults.branch,
      token: parsed.token || "",
      rememberToken: Boolean(parsed.rememberToken)
    };
  } catch (error) {
    return {
      owner: defaults.owner,
      repo: defaults.repo,
      branch: defaults.branch,
      token: "",
      rememberToken: false
    };
  }
}

function savePublishSettings(settings) {
  localStorage.setItem(
    PUBLISH_SETTINGS_KEY,
    JSON.stringify({
      owner: settings.owner,
      repo: settings.repo,
      branch: settings.branch,
      token: settings.rememberToken ? settings.token : "",
      rememberToken: Boolean(settings.rememberToken)
    })
  );
}

function clearSavedToken() {
  const settings = loadPublishSettings();
  settings.token = "";
  settings.rememberToken = false;
  savePublishSettings(settings);
}

function fillPublishForm() {
  const settings = loadPublishSettings();
  const ownerInput = document.getElementById("publishOwner");
  const repoInput = document.getElementById("publishRepo");
  const branchInput = document.getElementById("publishBranch");
  const tokenInput = document.getElementById("publishToken");
  const rememberInput = document.getElementById("rememberToken");

  if (!ownerInput || !repoInput || !branchInput || !tokenInput || !rememberInput) {
    return;
  }

  ownerInput.value = settings.owner;
  repoInput.value = settings.repo;
  branchInput.value = settings.branch;
  tokenInput.value = settings.token;
  rememberInput.checked = settings.rememberToken;
}

function getPublishPayloadFromForm() {
  const owner = String(document.getElementById("publishOwner")?.value || "").trim();
  const repo = String(document.getElementById("publishRepo")?.value || "").trim();
  const branch = String(document.getElementById("publishBranch")?.value || "").trim();
  const token = String(document.getElementById("publishToken")?.value || "").trim();
  const rememberToken = Boolean(document.getElementById("rememberToken")?.checked);

  return { owner, repo, branch, token, rememberToken };
}

function toBase64Utf8(content) {
  const bytes = new TextEncoder().encode(content);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
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
  const output = `${JSON.stringify(draftItems, null, 2)}\n`;
  const blob = new Blob([output], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "items.json";
  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  showMessage("Downloaded items.json. You can publish with the button below or via git push.");
}

async function fetchExistingItemsFileSha(owner, repo, branch, token) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${PUBLISH_PATH}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(token)
  });

  if (response.status === 404) {
    return null;
  }

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message = data?.message || `Could not read ${PUBLISH_PATH} (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return data?.sha || null;
}

async function publishDraftLive(event) {
  event.preventDefault();

  const publishButton = document.getElementById("publishBtn");
  const settings = getPublishPayloadFromForm();
  const { owner, repo, branch, token, rememberToken } = settings;

  if (!owner || !repo || !branch || !token) {
    showMessage("Owner, repository, branch, and token are required to publish.");
    return;
  }

  if (publishButton) {
    publishButton.disabled = true;
    publishButton.textContent = "Publishing...";
  }

  savePublishSettings(settings);

  try {
    const sha = await fetchExistingItemsFileSha(owner, repo, branch, token);
    const content = toBase64Utf8(`${JSON.stringify(draftItems, null, 2)}\n`);
    const commitMessage = `Update catalog items (${new Date().toISOString()})`;
    const payload = {
      message: commitMessage,
      content,
      branch
    };

    if (sha) {
      payload.sha = sha;
    }

    const publishUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${PUBLISH_PATH}`;
    const response = await fetch(publishUrl, {
      method: "PUT",
      headers: githubHeaders(token),
      body: JSON.stringify(payload)
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      const message = data?.message || `Publish failed (HTTP ${response.status}).`;
      throw new Error(message);
    }

    const commitUrl = data?.commit?.html_url;
    if (commitUrl) {
      showMessage(`Published. Commit created: ${commitUrl}. Site should refresh in about 30-90 seconds.`);
    } else {
      showMessage("Published. GitHub Pages should refresh in about 30-90 seconds.");
    }

    if (!rememberToken) {
      const tokenInput = document.getElementById("publishToken");
      if (tokenInput instanceof HTMLInputElement) {
        tokenInput.value = "";
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not publish. Check repo settings and token scope.";
    showMessage(`Publish failed: ${message}`);
  } finally {
    if (publishButton) {
      publishButton.disabled = false;
      publishButton.textContent = "Publish Live to Website";
    }
  }
}

function bindEvents() {
  const form = document.getElementById("itemForm");
  const publishForm = document.getElementById("publishForm");
  const list = document.getElementById("itemList");
  const downloadBtn = document.getElementById("downloadBtn");
  const reloadBtn = document.getElementById("reloadBtn");
  const clearTokenBtn = document.getElementById("clearTokenBtn");

  if (form) {
    form.addEventListener("submit", addItemFromForm);
  }

  if (publishForm) {
    publishForm.addEventListener("submit", publishDraftLive);
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

  if (clearTokenBtn) {
    clearTokenBtn.addEventListener("click", () => {
      clearSavedToken();
      const tokenInput = document.getElementById("publishToken");
      const rememberInput = document.getElementById("rememberToken");
      if (tokenInput instanceof HTMLInputElement) {
        tokenInput.value = "";
      }
      if (rememberInput instanceof HTMLInputElement) {
        rememberInput.checked = false;
      }
      showMessage("Saved token cleared from this browser.");
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
  fillPublishForm();
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
