// traiex Options Page Script

// defaultSettings, getFaviconUrl, and escapeHtml are loaded from js/utils.js
// Data loaded from js/data.js:
// - defaultDockSites
// - dockSitePresets
// - defaultBookmarkCategories

// Current bookmark categories
let bookmarkCategories = [];
// Current dock sites
let currentDockSites = [];

// Category limits
const MIN_CATEGORIES = 2;
const MAX_CATEGORIES = 4;

// DOM Elements
const form = document.getElementById("settings-form");
const showDateTimeCheckbox = document.getElementById("showDateTime");
const showDockCheckbox = document.getElementById("showDock");
const showBookmarksCheckbox = document.getElementById("showBookmarks");
const searchEngineSelect = document.getElementById("searchEngine");
const themeSelect = document.getElementById("theme");
const lightBgColorInput = document.getElementById("lightBgColor");
const colorValueSpan = document.getElementById("colorValue");
const colorPresets = document.querySelectorAll(".color-preset");
const resetBtn = document.getElementById("reset-btn");
const toastContainer = document.getElementById("toast-container");
const categoriesContainer = document.getElementById("bookmark-categories");
const searchBorderRadiusInput = document.getElementById("searchBorderRadius");
const borderRadiusValueSpan = document.getElementById("borderRadiusValue");
const bookmarksFontWeightSelect = document.getElementById(
  "bookmarksFontWeight",
);
const activeDockContainer = document.getElementById("active-dock-sites");
const presetDockContainer = document.getElementById("preset-dock-sites");
const linkTargetSelect = document.getElementById("linkTarget");
const showDockLabelsCheckbox = document.getElementById("showDockLabels");
const languageSelect = document.getElementById("language");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file");
const saveSearchHistoryCheckbox = document.getElementById("saveSearchHistory");
const maxSearchHistorySelect = document.getElementById("maxSearchHistory");
const maxSearchHistorySection = document.getElementById(
  "maxSearchHistorySection",
);
const clearSearchHistorySection = document.getElementById(
  "clearSearchHistorySection",
);
const clearSearchHistoryBtn = document.getElementById("clearSearchHistoryBtn");

// Touch drag state for mobile support
let touchDragState = {
  isDragging: false,
  startY: 0,
  currentElement: null,
  placeholder: null,
  dragType: null, // 'category' or 'dock'
  fromIndex: null,
};

// Get touch Y position
function getTouchY(e) {
  return e.touches ? e.touches[0].clientY : e.clientY;
}

// Find the category element at a given Y position
function getCategoryAtPosition(y, excludeElement) {
  const categories = document.querySelectorAll(".bookmark-category");
  for (const cat of categories) {
    if (cat === excludeElement) continue;
    const rect = cat.getBoundingClientRect();
    if (y >= rect.top && y <= rect.bottom) {
      return cat;
    }
  }
  return null;
}

// Handle touch start for category drag
function handleCategoryTouchStart(e, catIndex, categoryEl) {
  // Only start drag from the drag handle
  const handle = categoryEl.querySelector(".drag-handle");
  if (!handle || !handle.contains(e.target)) return;

  e.preventDefault();
  touchDragState.isDragging = true;
  touchDragState.startY = getTouchY(e);
  touchDragState.currentElement = categoryEl;
  touchDragState.dragType = "category";
  touchDragState.fromIndex = catIndex;

  categoryEl.classList.add("dragging");
}

// Handle touch move for category drag
function handleCategoryTouchMove(e) {
  if (!touchDragState.isDragging || touchDragState.dragType !== "category")
    return;
  e.preventDefault();

  const y = getTouchY(e);
  const target = getCategoryAtPosition(y, touchDragState.currentElement);

  // Remove drag-over from all categories
  document.querySelectorAll(".bookmark-category").forEach((cat) => {
    cat.classList.remove("drag-over");
  });

  // Add drag-over to target
  if (target) {
    target.classList.add("drag-over");
  }
}

// Handle touch end for category drag
function handleCategoryTouchEnd(e) {
  if (!touchDragState.isDragging || touchDragState.dragType !== "category")
    return;

  const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
  const target = getCategoryAtPosition(y, touchDragState.currentElement);

  if (target) {
    const toIndex = parseInt(target.dataset.catIndex);
    const fromIndex = touchDragState.fromIndex;

    if (!isNaN(toIndex) && fromIndex !== toIndex) {
      const [moved] = bookmarkCategories.splice(fromIndex, 1);
      bookmarkCategories.splice(toIndex, 0, moved);
      renderCategories();
    }
  }

  // Cleanup
  document.querySelectorAll(".bookmark-category").forEach((cat) => {
    cat.classList.remove("dragging", "drag-over");
  });

  touchDragState.isDragging = false;
  touchDragState.currentElement = null;
  touchDragState.dragType = null;
  touchDragState.fromIndex = null;
}

// Update color value display
function updateColorDisplay(color) {
  lightBgColorInput.value = color;
  colorValueSpan.textContent = color.toUpperCase();

  colorPresets.forEach((preset) => {
    if (preset.dataset.color.toUpperCase() === color.toUpperCase()) {
      preset.classList.add("selected");
    } else {
      preset.classList.remove("selected");
    }
  });
}

// Update border radius display
function updateBorderRadiusDisplay(value) {
  searchBorderRadiusInput.value = value;
  borderRadiusValueSpan.textContent = value + "px";
}

// Apply theme and custom background color to the options page
function applyOptionsTheme() {
  const root = document.documentElement;
  const theme = themeSelect.value;
  const lightBgColor = lightBgColorInput.value;

  // Remove any existing theme class
  root.classList.remove("theme-light", "theme-dark");

  if (theme === "light") {
    root.classList.add("theme-light");
    applyOptionsLightBgColor(lightBgColor);
  } else if (theme === "dark") {
    root.classList.add("theme-dark");
    root.style.removeProperty("--primary-background-color");
  } else {
    // Auto mode - apply light bg color if system is in light mode
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      applyOptionsLightBgColor(lightBgColor);
    } else {
      root.style.removeProperty("--primary-background-color");
    }
  }
}

// Apply custom light mode background color on options page
function applyOptionsLightBgColor(color) {
  if (color && color.toUpperCase() !== "#DDE2EF") {
    document.documentElement.style.setProperty(
      "--primary-background-color",
      color,
    );
  } else {
    document.documentElement.style.removeProperty("--primary-background-color");
  }
}

// Render all bookmark categories
function renderCategories() {
  categoriesContainer.innerHTML = "";

  // Determine if delete buttons should be shown
  const canDelete = bookmarkCategories.length > MIN_CATEGORIES;
  const canAdd = bookmarkCategories.length < MAX_CATEGORIES;

  bookmarkCategories.forEach((category, catIndex) => {
    const categoryEl = document.createElement("div");
    categoryEl.className = "bookmark-category";
    categoryEl.dataset.catIndex = catIndex;

    // Enable drag and drop for category reordering
    categoryEl.draggable = true;
    categoryEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("category-index", catIndex);
      categoryEl.classList.add("dragging");
    });
    categoryEl.addEventListener("dragend", () => {
      categoryEl.classList.remove("dragging");
    });
    categoryEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer.types.includes("category-index")) {
        categoryEl.classList.add("drag-over");
      }
    });
    categoryEl.addEventListener("dragleave", () => {
      categoryEl.classList.remove("drag-over");
    });
    categoryEl.addEventListener("drop", (e) => {
      e.preventDefault();
      categoryEl.classList.remove("drag-over");
      const fromIndex = parseInt(e.dataTransfer.getData("category-index"));
      const toIndex = catIndex;
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        const [moved] = bookmarkCategories.splice(fromIndex, 1);
        bookmarkCategories.splice(toIndex, 0, moved);
        renderCategories();
      }
    });

    // Touch support for mobile
    categoryEl.addEventListener(
      "touchstart",
      (e) => handleCategoryTouchStart(e, catIndex, categoryEl),
      { passive: false },
    );

    // Delete button HTML (only show if can delete)
    const deleteButtonHtml = canDelete
      ? `<button type="button" class="delete-category-btn" data-cat-index="${catIndex}" title="${t("delete_category")}">×</button>`
      : "";

    categoryEl.innerHTML = `
      <div class="category-header">
        <span class="drag-handle" title="拖拽排序">⋮⋮</span>
        <input type="text" class="category-name-input" value="${escapeHtml(category.name)}" 
               data-cat-index="${catIndex}" placeholder="分类名称">
        ${deleteButtonHtml}
      </div>
      <div class="category-bookmarks" data-cat-index="${catIndex}">
        ${renderBookmarkItems(category.bookmarks, catIndex)}
        <div class="add-bookmark-inline">
          <input type="text" class="name-input" placeholder="名称" data-cat-index="${catIndex}">
          <input type="url" class="url-input" placeholder="https://..." data-cat-index="${catIndex}">
          <button type="button" class="add-btn" data-cat-index="${catIndex}">+</button>
        </div>
      </div>
    `;
    categoriesContainer.appendChild(categoryEl);
  });

  // Add "Add Category" button at the bottom
  if (canAdd) {
    const addCategoryBtn = document.createElement("button");
    addCategoryBtn.type = "button";
    addCategoryBtn.className = "add-category-btn";
    addCategoryBtn.innerHTML = `<span>+</span> ${t("add_category")}`;
    addCategoryBtn.addEventListener("click", addCategory);
    categoriesContainer.appendChild(addCategoryBtn);
  }

  // Add event listeners
  setupCategoryEventListeners();
}

// Render bookmark items for a category
function renderBookmarkItems(bookmarks, catIndex) {
  if (bookmarks.length === 0) {
    return '<div class="bookmarks-empty">暂无书签</div>';
  }

  return bookmarks
    .map(
      (bookmark, bookmarkIndex) => `
    <div class="bookmark-item">
      <img class="favicon" src="${getFaviconUrl(bookmark.url)}" alt="" onerror="this.style.display='none'">
      <span class="bookmark-name">${escapeHtml(bookmark.name)}</span>
      <span class="bookmark-url">${escapeHtml(bookmark.url)}</span>
      <button type="button" class="delete-btn" data-cat-index="${catIndex}" data-bookmark-index="${bookmarkIndex}" title="删除">×</button>
    </div>
  `,
    )
    .join("");
}

// Setup event listeners for category elements
function setupCategoryEventListeners() {
  // Category name change
  categoriesContainer
    .querySelectorAll(".category-name-input")
    .forEach((input) => {
      input.addEventListener("change", (e) => {
        const catIndex = parseInt(e.target.dataset.catIndex);
        bookmarkCategories[catIndex].name =
          e.target.value.trim() || `分类 ${catIndex + 1}`;
      });
    });

  // Delete category buttons
  categoriesContainer
    .querySelectorAll(".delete-category-btn")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const catIndex = parseInt(e.target.dataset.catIndex);
        deleteCategory(catIndex);
      });
    });

  // Delete bookmark buttons
  categoriesContainer.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const catIndex = parseInt(e.target.dataset.catIndex);
      const bookmarkIndex = parseInt(e.target.dataset.bookmarkIndex);
      deleteBookmark(catIndex, bookmarkIndex);
    });
  });

  // Add bookmark buttons
  categoriesContainer.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const catIndex = parseInt(e.target.dataset.catIndex);
      addBookmarkToCategory(catIndex);
    });
  });

  // Enter key to add bookmark
  categoriesContainer.querySelectorAll(".url-input").forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const catIndex = parseInt(e.target.dataset.catIndex);
        addBookmarkToCategory(catIndex);
      }
    });
  });
}

// Add bookmark to specific category
function addBookmarkToCategory(catIndex) {
  const container = categoriesContainer.querySelector(
    `.category-bookmarks[data-cat-index="${catIndex}"]`,
  );
  const nameInput = container.querySelector(".name-input");
  const urlInput = container.querySelector(".url-input");

  const name = nameInput.value.trim();
  let url = urlInput.value.trim();

  if (!name) {
    showToast("请输入书签名称", "warning");
    nameInput.focus();
    return;
  }

  if (!url) {
    showToast("请输入书签网址", "warning");
    urlInput.focus();
    return;
  }

  // Auto-add https if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    new URL(url);
  } catch {
    showToast("请输入有效的网址", "warning");
    urlInput.focus();
    return;
  }

  // Check for duplicate URL
  for (const category of bookmarkCategories) {
    const existingBookmark = category.bookmarks.find((b) => b.url === url);
    if (existingBookmark) {
      showToast(`该网址已存在于"${category.name}"分类中`, "warning");
      urlInput.focus();
      urlInput.select();
      return;
    }
  }

  bookmarkCategories[catIndex].bookmarks.push({ name, url });
  renderCategories();

  // Focus on new name input
  const newContainer = categoriesContainer.querySelector(
    `.category-bookmarks[data-cat-index="${catIndex}"]`,
  );
  newContainer.querySelector(".name-input").focus();
}

// Delete bookmark from category
function deleteBookmark(catIndex, bookmarkIndex) {
  bookmarkCategories[catIndex].bookmarks.splice(bookmarkIndex, 1);
  renderCategories();
}

// Add new category
function addCategory() {
  if (bookmarkCategories.length >= MAX_CATEGORIES) {
    showToast(t("category_limit_max"), "warning");
    return;
  }

  bookmarkCategories.push({
    name: t("new_category"),
    bookmarks: [],
  });
  renderCategories();

  // Focus on the new category name input
  const inputs = categoriesContainer.querySelectorAll(".category-name-input");
  const lastInput = inputs[inputs.length - 1];
  if (lastInput) {
    lastInput.focus();
    lastInput.select();
  }
}

// Delete category
function deleteCategory(catIndex) {
  if (bookmarkCategories.length <= MIN_CATEGORIES) {
    showToast(t("category_limit_min"), "warning");
    return;
  }

  const categoryName = bookmarkCategories[catIndex].name;
  if (confirm(t("delete_category_confirm"))) {
    bookmarkCategories.splice(catIndex, 1);
    renderCategories();
    showToast(`"${categoryName}" ${t("delete_category")}`, "success");
  }
}

// Render Dock Manager
function renderDockManager() {
  // Render Active Dock Sites
  activeDockContainer.innerHTML = "";
  if (currentDockSites.length === 0) {
    activeDockContainer.innerHTML =
      '<div class="bookmarks-empty">暂无站点</div>';
  } else {
    currentDockSites.forEach((site, index) => {
      const el = document.createElement("div");
      el.className = "dock-site-item";
      el.title = `拖拽排序 | 点击移除 ${site.name}`;
      // Use img tag for icon file reference, or fallback to inline SVG for legacy data
      if (site.icon) {
        const img = document.createElement("img");
        img.src = site.icon;
        img.alt = site.name;
        img.className = "dock-icon";
        el.appendChild(img);
      } else if (site.svg) {
        el.innerHTML = site.svg;
      }
      el.dataset.index = index;

      // Drag and drop for reordering
      el.draggable = true;
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", index);
        el.classList.add("dragging");
      });
      el.addEventListener("dragend", () => {
        el.classList.remove("dragging");
      });
      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        el.classList.add("drag-over");
      });
      el.addEventListener("dragleave", () => {
        el.classList.remove("drag-over");
      });
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("drag-over");
        const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
        const toIndex = index;
        if (fromIndex !== toIndex) {
          // Reorder array
          const [moved] = currentDockSites.splice(fromIndex, 1);
          currentDockSites.splice(toIndex, 0, moved);
          renderDockManager();
        }
      });

      el.addEventListener("click", () => removeDockSite(index));
      activeDockContainer.appendChild(el);
    });
  }

  // Render Presets (filter out already added sites)
  presetDockContainer.innerHTML = "";
  const currentUrls = currentDockSites.map((s) => s.url);
  const availablePresets = dockSitePresets.filter(
    (preset) => !currentUrls.includes(preset.url),
  );

  if (availablePresets.length === 0) {
    presetDockContainer.innerHTML =
      '<div class="bookmarks-empty">所有预设已添加</div>';
  } else {
    availablePresets.forEach((preset) => {
      const el = document.createElement("div");
      el.className = "dock-site-item";
      el.title = `添加 ${preset.name}`;
      // Use img tag for icon file reference, or fallback to inline SVG for legacy data
      if (preset.icon) {
        const img = document.createElement("img");
        img.src = preset.icon;
        img.alt = preset.name;
        img.className = "dock-icon";
        el.appendChild(img);
      } else if (preset.svg) {
        el.innerHTML = preset.svg;
      }
      el.addEventListener("click", () => addDockSite(preset));
      presetDockContainer.appendChild(el);
    });
  }
}

// Max dock sites limit
const MAX_DOCK_SITES = 10;

// Add dock site
function addDockSite(site) {
  // Check max limit
  if (currentDockSites.length >= MAX_DOCK_SITES) {
    showToast(
      t("dock_limit_reached").replace("{max}", MAX_DOCK_SITES),
      "warning",
    );
    return;
  }

  // Check for duplicates based on URL
  const exists = currentDockSites.some((s) => s.url === site.url);
  if (exists) {
    showToast(`${site.name} ${t("dock_site_exists")}`, "warning");
    return;
  }

  currentDockSites.push(site);
  renderDockManager();

  // Auto-enable dock if it was empty (optional user experience enhancement)
  if (currentDockSites.length === 1 && !showDockCheckbox.checked) {
    showDockCheckbox.checked = true;
    showToast(t("dock_auto_enabled"), "success");
  }
}

// Remove dock site
function removeDockSite(index) {
  currentDockSites.splice(index, 1);
  renderDockManager();

  // Auto hide dock if empty
  if (currentDockSites.length === 0) {
    showDockCheckbox.checked = false;
    showToast(t("dock_empty_hidden"), "warning");
  }
}

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get({
      ...defaultSettings,
      bookmarkCategories: null,
    });

    showDateTimeCheckbox.checked = result.showDateTime;
    showDockCheckbox.checked = result.showDock;
    showBookmarksCheckbox.checked = result.showBookmarks;
    searchEngineSelect.value = result.searchEngine;
    themeSelect.value = result.theme;
    updateColorDisplay(result.lightBgColor);
    updateBorderRadiusDisplay(result.searchBorderRadius);
    bookmarksFontWeightSelect.value = result.bookmarksFontWeight;
    linkTargetSelect.value = result.linkTarget || "_blank";
    showDockLabelsCheckbox.checked = result.showDockLabels || false;
    languageSelect.value = result.language || "zh-CN";

    // Apply theme to options page
    applyOptionsTheme();

    // Search history settings
    saveSearchHistoryCheckbox.checked = result.saveSearchHistory || false;
    maxSearchHistorySelect.value = result.maxSearchHistory || 10;
    updateSearchHistoryVisibility(result.saveSearchHistory || false);

    // Initialize i18n with saved language
    initI18n(result.language || "zh-CN");

    // Load bookmark categories
    bookmarkCategories =
      result.bookmarkCategories ||
      JSON.parse(JSON.stringify(defaultBookmarkCategories));
    renderCategories();

    // Load dock sites
    currentDockSites =
      result.dockSites || JSON.parse(JSON.stringify(defaultDockSites));
    renderDockManager();
  } catch (error) {
    console.error("Failed to load settings:", error);
    showDateTimeCheckbox.checked = defaultSettings.showDateTime;
    showDockCheckbox.checked = defaultSettings.showDock;
    showBookmarksCheckbox.checked = defaultSettings.showBookmarks;
    searchEngineSelect.value = defaultSettings.searchEngine;
    themeSelect.value = defaultSettings.theme;
    updateColorDisplay(defaultSettings.lightBgColor);
    updateBorderRadiusDisplay(defaultSettings.searchBorderRadius);
    bookmarksFontWeightSelect.value = defaultSettings.bookmarksFontWeight;
    linkTargetSelect.value = defaultSettings.linkTarget;
    bookmarkCategories = JSON.parse(JSON.stringify(defaultBookmarkCategories));
    renderCategories();
    currentDockSites = JSON.parse(JSON.stringify(defaultDockSites));
    renderDockManager();
  }
}

// Save settings to storage
async function saveSettings(e) {
  e.preventDefault();

  const settings = {
    showDateTime: showDateTimeCheckbox.checked,
    showDock: showDockCheckbox.checked,
    showBookmarks: showBookmarksCheckbox.checked,
    searchEngine: searchEngineSelect.value,
    theme: themeSelect.value,
    lightBgColor: lightBgColorInput.value,
    searchBorderRadius: parseInt(searchBorderRadiusInput.value),
    bookmarksFontWeight: parseInt(bookmarksFontWeightSelect.value),
    linkTarget: linkTargetSelect.value,
    showDockLabels: showDockLabelsCheckbox.checked,
    language: languageSelect.value,
    saveSearchHistory: saveSearchHistoryCheckbox.checked,
    maxSearchHistory: parseInt(maxSearchHistorySelect.value),
    bookmarkCategories: bookmarkCategories,
    dockSites: currentDockSites,
  };

  try {
    await chrome.storage.sync.set(settings);
    showToast(t("settings_saved"), "success");
  } catch (error) {
    console.error("Failed to save settings:", error);
    showToast("保存设置失败，请重试。", "error");
  }
}

// Reset to default settings
async function resetSettings() {
  if (confirm("确定要恢复默认设置吗？这将重置所有设置和书签。")) {
    try {
      const resetData = {
        ...defaultSettings,
        bookmarkCategories: JSON.parse(
          JSON.stringify(defaultBookmarkCategories),
        ),
        dockSites: JSON.parse(JSON.stringify(defaultDockSites)),
      };
      await chrome.storage.sync.set(resetData);

      showDateTimeCheckbox.checked = defaultSettings.showDateTime;
      showDockCheckbox.checked = defaultSettings.showDock;
      showBookmarksCheckbox.checked = defaultSettings.showBookmarks;
      searchEngineSelect.value = defaultSettings.searchEngine;
      themeSelect.value = defaultSettings.theme;
      updateColorDisplay(defaultSettings.lightBgColor);
      updateBorderRadiusDisplay(defaultSettings.searchBorderRadius);
      bookmarksFontWeightSelect.value = defaultSettings.bookmarksFontWeight;
      languageSelect.value = defaultSettings.language;
      setLanguage(defaultSettings.language);
      applyOptionsTheme();
      saveSearchHistoryCheckbox.checked = defaultSettings.saveSearchHistory;
      maxSearchHistorySelect.value = defaultSettings.maxSearchHistory;
      updateSearchHistoryVisibility(defaultSettings.saveSearchHistory);
      bookmarkCategories = JSON.parse(
        JSON.stringify(defaultBookmarkCategories),
      );
      renderCategories();
      currentDockSites = JSON.parse(JSON.stringify(defaultDockSites));
      renderDockManager();

      showToast(t("settings_reset"), "success");
    } catch (error) {
      console.error("Failed to reset settings:", error);
      showToast("重置设置失败，请重试。", "error");
    }
  }
}

// Show toast notification
function showToast(message, type = "success", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "✓";
  if (type === "error") icon = "✕";
  if (type === "warning") icon = "!";

  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(message)}</span>`;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");

    // Remove from DOM after animation
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Setup color preset click handlers
function setupColorPresets() {
  colorPresets.forEach((preset) => {
    preset.addEventListener("click", () => {
      const color = preset.dataset.color;
      updateColorDisplay(color);
    });
  });
}

// Setup color input change handler
function setupColorInput() {
  lightBgColorInput.addEventListener("input", (e) => {
    const color = e.target.value;
    updateColorDisplay(color);
  });
}

// Setup border radius input change handler
function setupBorderRadiusInput() {
  searchBorderRadiusInput.addEventListener("input", (e) => {
    const value = e.target.value;
    updateBorderRadiusDisplay(value);
  });
}

// Export settings to JSON file
function exportSettings() {
  const settings = {
    showDateTime: showDateTimeCheckbox.checked,
    showDock: showDockCheckbox.checked,
    showBookmarks: showBookmarksCheckbox.checked,
    searchEngine: searchEngineSelect.value,
    theme: themeSelect.value,
    lightBgColor: lightBgColorInput.value,
    searchBorderRadius: parseInt(searchBorderRadiusInput.value),
    bookmarksFontWeight: parseInt(bookmarksFontWeightSelect.value),
    linkTarget: linkTargetSelect.value,
    bookmarkCategories: bookmarkCategories,
    dockSites: currentDockSites,
  };

  const blob = new Blob([JSON.stringify(settings, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `traichu-settings-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("设置已导出", "success");
}

// Import settings from JSON file
async function importSettings(file) {
  try {
    const text = await file.text();
    const settings = JSON.parse(text);

    // Validate imported data
    if (typeof settings !== "object" || settings === null) {
      throw new Error("Invalid settings format");
    }

    // Apply imported settings to UI
    if (settings.showDateTime !== undefined)
      showDateTimeCheckbox.checked = settings.showDateTime;
    if (settings.showDock !== undefined)
      showDockCheckbox.checked = settings.showDock;
    if (settings.showBookmarks !== undefined)
      showBookmarksCheckbox.checked = settings.showBookmarks;
    if (settings.searchEngine) searchEngineSelect.value = settings.searchEngine;
    if (settings.theme) themeSelect.value = settings.theme;
    if (settings.lightBgColor) updateColorDisplay(settings.lightBgColor);
    if (settings.searchBorderRadius !== undefined)
      updateBorderRadiusDisplay(settings.searchBorderRadius);
    if (settings.bookmarksFontWeight)
      bookmarksFontWeightSelect.value = settings.bookmarksFontWeight;
    if (settings.linkTarget) linkTargetSelect.value = settings.linkTarget;
    if (settings.bookmarkCategories) {
      bookmarkCategories = settings.bookmarkCategories;
      renderCategories();
    }
    if (settings.dockSites) {
      currentDockSites = settings.dockSites;
      renderDockManager();
    }

    showToast("设置已导入，请点击保存以应用", "success");
  } catch (error) {
    console.error("Import failed:", error);
    showToast("导入失败：文件格式无效", "error");
  }
}

// Setup import/export handlers
function setupImportExport() {
  exportBtn.addEventListener("click", exportSettings);
  importBtn.addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      importSettings(e.target.files[0]);
      e.target.value = ""; // Reset for same file selection
    }
  });
}

// Update search history related section visibility
function updateSearchHistoryVisibility(isEnabled) {
  maxSearchHistorySection.style.display = isEnabled ? "" : "none";
  clearSearchHistorySection.style.display = isEnabled ? "" : "none";
}

// Clear search history from local storage
async function clearSearchHistory() {
  if (confirm(t("delete_confirm") || "确定要清除搜索历史吗？")) {
    try {
      await chrome.storage.local.remove("searchHistory");
      showToast(t("search_history_cleared"), "success");
    } catch (error) {
      console.error("Failed to clear search history:", error);
      showToast("清除失败，请重试。", "error");
    }
  }
}

// Setup live preview listeners (no auto-save, just instant UI feedback)
function setupLivePreview() {
  // Language selector needs special handling for instant UI update
  languageSelect.addEventListener("change", () => {
    setLanguage(languageSelect.value);
  });

  // Theme selector needs special handling for instant preview
  themeSelect.addEventListener("change", () => {
    applyOptionsTheme();
  });

  // Color input needs special handling for instant preview
  lightBgColorInput.addEventListener("input", () => {
    applyOptionsTheme();
  });

  // Color presets need special handling for instant preview
  colorPresets.forEach((preset) => {
    preset.addEventListener("click", () => {
      // Small delay to let updateColorDisplay finish first
      requestAnimationFrame(() => applyOptionsTheme());
    });
  });

  // Search history toggle needs special handling for visibility
  saveSearchHistoryCheckbox.addEventListener("change", () => {
    updateSearchHistoryVisibility(saveSearchHistoryCheckbox.checked);
  });
}

// Event listeners
form.addEventListener("submit", saveSettings);
resetBtn.addEventListener("click", resetSettings);

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupColorPresets();
  setupColorInput();
  setupBorderRadiusInput();
  setupImportExport();
  setupLivePreview();

  // Clear search history button
  clearSearchHistoryBtn.addEventListener("click", clearSearchHistory);

  // Global touch event listeners for mobile drag support
  document.addEventListener("touchmove", handleCategoryTouchMove, {
    passive: false,
  });
  document.addEventListener("touchend", handleCategoryTouchEnd);
  document.addEventListener("touchcancel", handleCategoryTouchEnd);
});
