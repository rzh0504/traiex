// defaultSettings and getFaviconUrl are loaded from js/utils.js

// Search engine configurations
const searchEngines = {
  google: { name: "Google", url: "https://www.google.com/search", param: "q" },
  bing: { name: "Bing", url: "https://www.bing.com/search", param: "q" },
  duckduckgo: {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/",
    param: "q",
  },
  baidu: { name: "百度", url: "https://www.baidu.com/s", param: "wd" },
};

// Default bookmark categories are loaded from js/data.js

// Current settings (loaded from storage)
let currentSettings = { ...defaultSettings };
let bookmarkCategories = null;
let dateTimeTimerId = null;
let currentDateLocale = "";
let timeFormatter = null;
let dateFormatter = null;

// Load settings from chrome.storage.sync
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get({
      ...defaultSettings,
      bookmarkCategories: null,
      dockSites: null,
    });
    currentSettings = result;
    bookmarkCategories = result.bookmarkCategories;
    return result;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return defaultSettings;
  }
}

// Apply settings to the page
function applySettings(settings) {
  document.documentElement.lang = settings.language || "zh-CN";

  // Apply visibility settings
  const dateTimeSection = document.getElementById("date-time");
  const dockSection = document.getElementById("dock");
  const bookmarksSection = document.getElementById("bookmarks");

  if (dateTimeSection) {
    dateTimeSection.style.display = settings.showDateTime ? "" : "none";
  }
  if (dockSection) {
    dockSection.style.display = settings.showDock ? "" : "none";
  }
  if (bookmarksSection) {
    bookmarksSection.style.display = settings.showBookmarks ? "" : "none";
    // Add extra margin when dock is hidden
    bookmarksSection.style.marginTop = settings.showDock ? "" : "2rem";
  }

  // Apply search engine
  const searchForm = document.querySelector("#search form");
  const searchInput = document.getElementById("q");
  if (searchForm) {
    const engine = searchEngines[settings.searchEngine] || searchEngines.google;
    searchForm.action = engine.url;
    searchForm.target = settings.linkTarget || "_blank";

    // Update input name attribute for the correct parameter
    if (searchInput) {
      searchInput.name = engine.param;
      // Set data attribute for CSS-based icon switching
      searchInput.dataset.engine = settings.searchEngine;
    }
  }

  // Apply search box border radius
  if (searchInput && settings.searchBorderRadius !== undefined) {
    searchInput.style.borderRadius = settings.searchBorderRadius + "px";
  }

  // Apply bookmarks font weight
  if (settings.bookmarksFontWeight !== undefined) {
    document.documentElement.style.setProperty(
      "--bookmarks-font-weight",
      settings.bookmarksFontWeight,
    );
  }

  // Apply theme
  applyTheme(settings.theme, settings.lightBgColor);

  if (settings.showDateTime) {
    renderDateTime(true);
  } else {
    stopDateTime();
  }
}

// Apply theme mode
function applyTheme(theme, lightBgColor) {
  const root = document.documentElement;

  // Remove any existing theme class
  root.classList.remove("theme-light", "theme-dark");

  if (theme === "light") {
    root.classList.add("theme-light");
    applyLightBgColor(lightBgColor);
  } else if (theme === "dark") {
    root.classList.add("theme-dark");
    root.style.removeProperty("--primary-background-color");
  } else {
    // Auto mode - apply light bg color if system is in light mode
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      applyLightBgColor(lightBgColor);
    } else {
      root.style.removeProperty("--primary-background-color");
    }
  }
}

// Apply custom light mode background color
function applyLightBgColor(color) {
  if (color && color !== "#DDE2EF") {
    document.documentElement.style.setProperty(
      "--primary-background-color",
      color,
    );
  } else {
    document.documentElement.style.removeProperty("--primary-background-color");
  }
}

// Time/Date formatting functions
function getTimeOptions() {
  return {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  };
}

function getDateOptions() {
  return {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };
}

let lastTimeString = "";

function updateDateTimeFormatters(locale) {
  if (currentDateLocale === locale && timeFormatter && dateFormatter) {
    return;
  }

  currentDateLocale = locale;
  timeFormatter = new Intl.DateTimeFormat(locale, getTimeOptions());
  dateFormatter = new Intl.DateTimeFormat(locale, getDateOptions());
}

function renderDateTime(force = false) {
  const date = new Date();
  const locale = currentSettings.language || "zh-CN";
  updateDateTimeFormatters(locale);
  const timeString = timeFormatter.format(date);
  const dateString = dateFormatter.format(date);

  // Only update DOM when values change (performance optimization)
  if (force || timeString !== lastTimeString) {
    const timeEl = document.getElementById("time");
    const dateEl = document.getElementById("date");

    // Create elements if they don't exist yet
    if (!timeEl || !dateEl) {
      const container = document.getElementById("date-time");
      container.innerHTML = '<p id="time"></p><p id="date"></p>';
    }

    document.getElementById("time").textContent = timeString;
    document.getElementById("date").textContent = dateString;
    lastTimeString = timeString;
  }
}

function scheduleDateTimeTick() {
  // Calculate delay until next minute for efficiency (instead of checking every second)
  const now = new Date();
  const msUntilNextMinute =
    (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50; // +50ms buffer
  clearTimeout(dateTimeTimerId);
  dateTimeTimerId = setTimeout(() => {
    renderDateTime();
    scheduleDateTimeTick();
  }, msUntilNextMinute);
}

function startDateTime() {
  renderDateTime(true);
  scheduleDateTimeTick();
}

function stopDateTime() {
  clearTimeout(dateTimeTimerId);
  dateTimeTimerId = null;
  lastTimeString = "";
}

// Render Dock Sites
function renderDock() {
  const dockContainer = document.getElementById("dock");
  const isEditMode = dockContainer.classList.contains("dock-edit-mode");
  const ul = document.createElement("ul");

  // Add class for labels if enabled
  if (currentSettings.showDockLabels) {
    ul.classList.add("with-labels");
  }

  // Use docked sites from settings, fallback to global dockSites (from data.js) if available
  const sites =
    Array.isArray(currentSettings.dockSites)
      ? currentSettings.dockSites
      : typeof dockSites !== "undefined"
        ? dockSites
        : [];

  sites.forEach((site, index) => {
    const li = document.createElement("li");
    li.dataset.index = index;
    if (isEditMode) li.setAttribute("draggable", "true");

    const a = document.createElement("a");
    a.href = site.url;
    // Use img tag for icon file reference, or fallback to inline SVG for legacy data
    if (site.icon) {
      const img = document.createElement("img");
      img.src = site.icon;
      img.alt = site.name;
      img.className = "dock-icon";
      a.appendChild(img);
    } else if (site.svg) {
      // Legacy SVG support
      a.innerHTML = site.svg;
    }
    a.setAttribute("aria-label", site.name);
    a.setAttribute("title", site.name);
    a.target = currentSettings.linkTarget || "_blank";
    if (a.target === "_blank") {
      a.rel = "noopener noreferrer";
    }

    // Add label if enabled
    if (currentSettings.showDockLabels) {
      const label = document.createElement("span");
      label.className = "dock-label";
      label.textContent = site.name;
      a.appendChild(label);
    }

    // Remove focus/hover state on click to prevent animation when returning to page
    a.addEventListener("click", function () {
      this.blur();
    });

    li.appendChild(a);
    ul.appendChild(li);
  });

  dockContainer.innerHTML = "";
  dockContainer.appendChild(ul);
}

// Dock long-press drag reorder
function setupDockDragReorder(dockContainer) {
  const LONG_PRESS_DURATION = 500; // ms
  let longPressTimer = null;
  let isEditMode = false;
  let dragSrcEl = null;
  let touchDragEl = null; // ghost element for touch drag
  let touchCurrentTarget = null;

  // --- Helper: get current sites array ---
  function getCurrentSites() {
    return Array.isArray(currentSettings.dockSites)
      ? currentSettings.dockSites
      : typeof dockSites !== "undefined"
        ? [...dockSites]
        : [];
  }

  // --- Helper: save new order ---
  function saveNewOrder() {
    const ul = dockContainer.querySelector("ul");
    if (!ul) return;
    const items = ul.querySelectorAll("li");
    const sites = getCurrentSites();
    const newSites = [];
    items.forEach((li) => {
      const idx = parseInt(li.dataset.index);
      if (sites[idx]) {
        newSites.push(sites[idx]);
      }
    });
    // Update data-index to reflect new order
    items.forEach((li, i) => {
      li.dataset.index = i;
    });
    currentSettings.dockSites = newSites;
    chrome.storage.sync.set({ dockSites: newSites });
  }

  // --- Helper: clear all drag-over classes ---
  function clearDragOverClasses() {
    dockContainer.querySelectorAll("li").forEach((li) => {
      li.classList.remove("drag-over-left", "drag-over-right");
    });
  }

  // --- Enter/Exit edit mode ---
  function enterEditMode() {
    if (isEditMode) return;
    isEditMode = true;
    dockContainer.classList.add("dock-edit-mode");

    const items = dockContainer.querySelectorAll("li");
    items.forEach((li) => {
      li.setAttribute("draggable", "true");
    });

    // Click anywhere outside dock to exit
    setTimeout(() => {
      document.addEventListener("click", exitOnOutsideClick);
      document.addEventListener("keydown", exitOnEscape);
    }, 10);
  }

  function exitEditMode() {
    if (!isEditMode) return;
    isEditMode = false;
    dockContainer.classList.remove("dock-edit-mode");
    clearDragOverClasses();

    const items = dockContainer.querySelectorAll("li");
    items.forEach((li) => {
      li.removeAttribute("draggable");
      li.classList.remove("dragging");
    });

    document.removeEventListener("click", exitOnOutsideClick);
    document.removeEventListener("keydown", exitOnEscape);
  }

  function exitOnOutsideClick(e) {
    if (!dockContainer.contains(e.target)) {
      exitEditMode();
    }
  }

  function exitOnEscape(e) {
    if (e.key === "Escape") {
      exitEditMode();
    }
  }

  // --- Long press detection ---
  function cancelLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  dockContainer.addEventListener("pointerdown", (e) => {
    const li = e.target.closest("#dock li");
    if (!li) return;

    cancelLongPress();
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      enterEditMode();
      // Prevent the upcoming click from navigating
      li.querySelector("a")?.addEventListener("click", preventClick, {
        once: true,
      });
    }, LONG_PRESS_DURATION);
  });

  dockContainer.addEventListener("pointerup", cancelLongPress);
  dockContainer.addEventListener("pointerleave", cancelLongPress);
  dockContainer.addEventListener("pointermove", (e) => {
    // Cancel long press if pointer moves too much (allow small jitter)
    if (
      longPressTimer &&
      (Math.abs(e.movementX) > 3 || Math.abs(e.movementY) > 3)
    ) {
      cancelLongPress();
    }
  });

  function preventClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // --- HTML5 Drag & Drop (desktop) ---
  dockContainer.addEventListener("dragstart", (e) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    const li = e.target.closest("#dock li");
    if (!li) return;
    dragSrcEl = li;
    li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", li.dataset.index);
  });

  dockContainer.addEventListener("dragover", (e) => {
    if (!isEditMode || !dragSrcEl) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const li = e.target.closest("#dock li");
    if (!li || li === dragSrcEl) {
      clearDragOverClasses();
      return;
    }

    clearDragOverClasses();
    // Determine if we're on the left or right half of the target
    const rect = li.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    if (e.clientX < midX) {
      li.classList.add("drag-over-left");
    } else {
      li.classList.add("drag-over-right");
    }
  });

  dockContainer.addEventListener("drop", (e) => {
    if (!isEditMode || !dragSrcEl) return;
    e.preventDefault();

    const li = e.target.closest("#dock li");
    if (!li || li === dragSrcEl) return;

    const ul = dockContainer.querySelector("ul");
    // Determine insert position based on cursor side
    const rect = li.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    if (e.clientX < midX) {
      ul.insertBefore(dragSrcEl, li);
    } else {
      ul.insertBefore(dragSrcEl, li.nextSibling);
    }

    saveNewOrder();
  });

  dockContainer.addEventListener("dragend", () => {
    if (dragSrcEl) {
      dragSrcEl.classList.remove("dragging");
      dragSrcEl = null;
    }
    clearDragOverClasses();
  });

  // --- Touch drag support (mobile) ---
  dockContainer.addEventListener(
    "touchmove",
    (e) => {
      if (!isEditMode) return;
      const li = e.target.closest("#dock li");
      if (!li || !li.classList.contains("dragging")) {
        // Start touch drag if in edit mode and we haven't started yet
        if (li && !dragSrcEl) {
          dragSrcEl = li;
          li.classList.add("dragging");
        }
        if (!dragSrcEl) return;
      }

      e.preventDefault();
      const touch = e.touches[0];

      // Create/move ghost element
      if (!touchDragEl) {
        touchDragEl = dragSrcEl.cloneNode(true);
        touchDragEl.style.cssText = `
        position: fixed; z-index: 9999; pointer-events: none;
        opacity: 0.8; transform: scale(1.1);
        left: ${touch.clientX - 30}px; top: ${touch.clientY - 30}px;
      `;
        document.body.appendChild(touchDragEl);
      } else {
        touchDragEl.style.left = touch.clientX - 30 + "px";
        touchDragEl.style.top = touch.clientY - 30 + "px";
      }

      // Find element under touch point
      if (touchDragEl) touchDragEl.style.display = "none";
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      if (touchDragEl) touchDragEl.style.display = "";

      const targetLi = elemBelow?.closest("#dock li");
      clearDragOverClasses();
      if (targetLi && targetLi !== dragSrcEl) {
        touchCurrentTarget = targetLi;
        const rect = targetLi.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        if (touch.clientX < midX) {
          targetLi.classList.add("drag-over-left");
        } else {
          targetLi.classList.add("drag-over-right");
        }
      } else {
        touchCurrentTarget = null;
      }
    },
    { passive: false },
  );

  dockContainer.addEventListener("touchend", (e) => {
    if (!isEditMode || !dragSrcEl) return;

    // Perform the swap if there's a valid target
    if (touchCurrentTarget && touchCurrentTarget !== dragSrcEl) {
      const ul = dockContainer.querySelector("ul");
      const lastTouch = e.changedTouches[0];
      const rect = touchCurrentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      if (lastTouch.clientX < midX) {
        ul.insertBefore(dragSrcEl, touchCurrentTarget);
      } else {
        ul.insertBefore(dragSrcEl, touchCurrentTarget.nextSibling);
      }
      saveNewOrder();
    }

    // Cleanup
    dragSrcEl.classList.remove("dragging");
    dragSrcEl = null;
    touchCurrentTarget = null;
    clearDragOverClasses();
    if (touchDragEl) {
      touchDragEl.remove();
      touchDragEl = null;
    }
  });

  // In edit mode, clicks on links should not navigate
  dockContainer.addEventListener(
    "click",
    (e) => {
      if (isEditMode) {
        const a = e.target.closest("#dock a");
        if (a) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    true,
  );
}

// Render Bookmarks (categorized layout)
function renderBookmarks() {
  const bookmarksContainer = document.getElementById("bookmarks");
  const isEditMode =
    bookmarksContainer.classList.contains("bookmark-edit-mode");
  bookmarksContainer.innerHTML = "";

  // Use stored categories or defaults
  const categories = bookmarkCategories || defaultBookmarkCategories;

  if (!categories || categories.length === 0) {
    return;
  }

  // Set data attribute for CSS to adjust layout based on column count
  bookmarksContainer.dataset.columns = categories.length;

  // Render each category as a column (ul)
  categories.forEach((category, catIndex) => {
    const ul = document.createElement("ul");
    ul.dataset.catIndex = catIndex;

    // Category name as first item (optional - styled differently)
    if (category.name) {
      const headerLi = document.createElement("li");
      headerLi.className = "category-header-item";
      headerLi.textContent = category.name;
      ul.appendChild(headerLi);
    }

    // Render bookmarks
    category.bookmarks.forEach((bookmark, bmIndex) => {
      const li = document.createElement("li");
      li.dataset.catIndex = catIndex;
      li.dataset.bmIndex = bmIndex;
      if (isEditMode) li.setAttribute("draggable", "true");

      const a = document.createElement("a");
      a.href = bookmark.url;
      a.target = currentSettings.linkTarget || "_blank";
      if (a.target === "_blank") {
        a.rel = "noopener noreferrer";
      }

      const img = document.createElement("img");
      img.src = getFaviconUrl(bookmark.url);
      img.className = "favicon";
      img.alt = bookmark.name + " favicon";
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = function () {
        this.style.display = "none";
      };

      a.appendChild(img);
      a.appendChild(document.createTextNode(bookmark.name));

      // Remove focus on click/touch for mobile (CSS :focus-visible handles desktop)
      a.addEventListener("click", function () {
        this.blur();
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    bookmarksContainer.appendChild(ul);
  });
}

// Bookmark long-press drag reorder
function setupBookmarkDragReorder(container) {
  const LONG_PRESS_DURATION = 500;
  let longPressTimer = null;
  let isEditMode = false;
  let dragSrcEl = null;
  let touchDragEl = null;
  let touchCurrentTarget = null;
  let touchStartX = 0;
  let touchStartY = 0;

  function getCategories() {
    return bookmarkCategories || defaultBookmarkCategories;
  }

  function isBookmarkLi(el) {
    return (
      el &&
      el.tagName === "LI" &&
      !el.classList.contains("category-header-item")
    );
  }

  function clearDragClasses() {
    container.querySelectorAll("li, ul").forEach((el) => {
      el.classList.remove(
        "bm-drag-over-top",
        "bm-drag-over-bottom",
        "bm-drag-over-ul",
      );
    });
  }

  function saveNewOrder() {
    const liveCategories = getCategories();
    // Create a deep copy of the original state before we start mutating it
    // otherwise reading from srcCats during the loop will fail when previous
    // categories have already had their .bookmarks array replaced.
    const snapshotCats = structuredClone(liveCategories);
    const newCategoriesData = structuredClone(liveCategories);

    const uls = container.querySelectorAll("ul");
    uls.forEach((ul, catIdx) => {
      if (!newCategoriesData[catIdx]) return;
      const newBookmarks = [];
      ul.querySelectorAll("li:not(.category-header-item)").forEach((li) => {
        const origCat = parseInt(li.dataset.catIndex);
        const origBm = parseInt(li.dataset.bmIndex);

        if (snapshotCats[origCat] && snapshotCats[origCat].bookmarks[origBm]) {
          newBookmarks.push(snapshotCats[origCat].bookmarks[origBm]);
        }
      });
      newCategoriesData[catIdx].bookmarks = newBookmarks;
    });

    // Update data attributes
    uls.forEach((ul, catIdx) => {
      ul.dataset.catIndex = catIdx;
      ul.querySelectorAll("li:not(.category-header-item)").forEach(
        (li, bmIdx) => {
          li.dataset.catIndex = catIdx;
          li.dataset.bmIndex = bmIdx;
        },
      );
    });

    bookmarkCategories = newCategoriesData;
    currentSettings.bookmarkCategories = newCategoriesData;
    chrome.storage.sync.set({ bookmarkCategories: newCategoriesData });
  }

  // --- Enter/Exit edit mode ---
  function enterEditMode() {
    if (isEditMode) return;
    isEditMode = true;

    // Clear any text selection and active focus
    window.getSelection()?.removeAllRanges();
    if (document.activeElement) document.activeElement.blur();

    container.classList.add("bookmark-edit-mode");
    container
      .querySelectorAll("li:not(.category-header-item)")
      .forEach((li) => {
        li.setAttribute("draggable", "true");
      });
    setTimeout(() => {
      document.addEventListener("click", exitOnOutsideClick);
      document.addEventListener("keydown", exitOnEscape);
    }, 10);
  }

  function exitEditMode() {
    if (!isEditMode) return;
    isEditMode = false;
    container.classList.remove("bookmark-edit-mode");
    clearDragClasses();
    container
      .querySelectorAll("li:not(.category-header-item)")
      .forEach((li) => {
        li.removeAttribute("draggable");
        li.classList.remove("bm-dragging");
      });
    document.removeEventListener("click", exitOnOutsideClick);
    document.removeEventListener("keydown", exitOnEscape);
  }

  function exitOnOutsideClick(e) {
    if (!container.contains(e.target)) exitEditMode();
  }
  function exitOnEscape(e) {
    if (e.key === "Escape") exitEditMode();
  }

  // --- Long press detection ---
  function cancelLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  container.addEventListener("pointerdown", (e) => {
    const li = e.target.closest("#bookmarks li");
    if (!li || !isBookmarkLi(li)) return;

    if (e.button === 2) return; // Ignore right click

    cancelLongPress();
    touchStartX = e.clientX;
    touchStartY = e.clientY;

    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      enterEditMode();
      li.querySelector("a")?.addEventListener("click", preventClick, {
        once: true,
      });
    }, LONG_PRESS_DURATION);
  });

  container.addEventListener("pointerup", cancelLongPress);
  container.addEventListener("pointerleave", cancelLongPress);
  container.addEventListener("pointermove", (e) => {
    if (longPressTimer) {
      if (
        Math.abs(e.clientX - touchStartX) > 10 ||
        Math.abs(e.clientY - touchStartY) > 10
      ) {
        cancelLongPress();
      }
    }
  });

  function preventClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // --- HTML5 Drag & Drop ---
  container.addEventListener("dragstart", (e) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    const li = e.target.closest("#bookmarks li");
    if (!li || !isBookmarkLi(li)) {
      e.preventDefault();
      return;
    }
    dragSrcEl = li;
    li.classList.add("bm-dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "bookmark");
  });

  container.addEventListener("dragover", (e) => {
    if (!isEditMode || !dragSrcEl) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const li = e.target.closest("#bookmarks li");
    const ul = e.target.closest("#bookmarks ul");

    if (li && isBookmarkLi(li) && li === dragSrcEl) {
      clearDragClasses();
      return;
    }

    clearDragClasses();

    if (li && isBookmarkLi(li)) {
      const rect = li.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        li.classList.add("bm-drag-over-top");
      } else {
        li.classList.add("bm-drag-over-bottom");
      }
    } else if (ul || (li && li.classList.contains("category-header-item"))) {
      const targetUl = ul || li.closest("ul");
      targetUl.classList.add("bm-drag-over-ul");
    }
  });

  container.addEventListener("drop", (e) => {
    if (!isEditMode || !dragSrcEl) return;
    e.preventDefault();

    const li = e.target.closest("#bookmarks li");
    const ul = e.target.closest("#bookmarks ul");

    if (li && isBookmarkLi(li) && li === dragSrcEl) return;

    const targetUl = ul || (li ? li.closest("ul") : null);
    if (!targetUl) return;

    if (li && isBookmarkLi(li)) {
      const rect = li.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        targetUl.insertBefore(dragSrcEl, li);
      } else {
        targetUl.insertBefore(dragSrcEl, li.nextSibling);
      }
    } else {
      // Drop into empty category or on header
      targetUl.appendChild(dragSrcEl);
    }

    saveNewOrder();
  });

  container.addEventListener("dragend", () => {
    if (dragSrcEl) {
      dragSrcEl.classList.remove("bm-dragging");
      dragSrcEl = null;
    }
    clearDragClasses();
  });

  // --- Touch drag support ---
  container.addEventListener(
    "touchmove",
    (e) => {
      if (!isEditMode) return;
      const li = e.target.closest("#bookmarks li");
      if (li && isBookmarkLi(li) && !dragSrcEl) {
        dragSrcEl = li;
        li.classList.add("bm-dragging");
      }
      if (!dragSrcEl) return;
      e.preventDefault();
      const touch = e.touches[0];

      if (!touchDragEl) {
        touchDragEl = dragSrcEl.cloneNode(true);
        touchDragEl.style.cssText = `
        position: fixed; z-index: 9999; pointer-events: none;
        opacity: 0.8; transform: scale(1.05);
        left: ${touch.clientX - 50}px; top: ${touch.clientY - 15}px;
        background: var(--primary-background-color); border-radius: 0.25rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
        document.body.appendChild(touchDragEl);
      } else {
        touchDragEl.style.left = touch.clientX - 50 + "px";
        touchDragEl.style.top = touch.clientY - 15 + "px";
      }

      if (touchDragEl) touchDragEl.style.display = "none";
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      if (touchDragEl) touchDragEl.style.display = "";

      const targetLi = elemBelow?.closest("#bookmarks li");
      const targetUl = elemBelow?.closest("#bookmarks ul");
      clearDragClasses();

      if (targetLi && isBookmarkLi(targetLi) && targetLi !== dragSrcEl) {
        touchCurrentTarget = { el: targetLi, type: "li" };
        const rect = targetLi.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (touch.clientY < midY) {
          targetLi.classList.add("bm-drag-over-top");
        } else {
          targetLi.classList.add("bm-drag-over-bottom");
        }
      } else if (
        targetUl ||
        (targetLi && targetLi.classList.contains("category-header-item"))
      ) {
        const theUl = targetUl || targetLi.closest("ul");
        touchCurrentTarget = { el: theUl, type: "ul" };
        theUl.classList.add("bm-drag-over-ul");
      } else {
        touchCurrentTarget = null;
      }
    },
    { passive: false },
  );

  container.addEventListener("touchend", (e) => {
    if (!isEditMode || !dragSrcEl) return;
    if (touchCurrentTarget && touchCurrentTarget.el !== dragSrcEl) {
      const targetEl = touchCurrentTarget.el;

      if (touchCurrentTarget.type === "li") {
        const ul = targetEl.closest("ul");
        const lastTouch = e.changedTouches[0];
        const rect = targetEl.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (lastTouch.clientY < midY) {
          ul.insertBefore(dragSrcEl, targetEl);
        } else {
          ul.insertBefore(dragSrcEl, targetEl.nextSibling);
        }
      } else if (touchCurrentTarget.type === "ul") {
        targetEl.appendChild(dragSrcEl);
      }

      saveNewOrder();
    }
    dragSrcEl.classList.remove("bm-dragging");
    dragSrcEl = null;
    touchCurrentTarget = null;
    clearDragClasses();
    if (touchDragEl) {
      touchDragEl.remove();
      touchDragEl = null;
    }
  });

  // Block link clicks in edit mode
  container.addEventListener(
    "click",
    (e) => {
      if (isEditMode) {
        const a = e.target.closest("#bookmarks a");
        if (a) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    true,
  );
}

// Search history functions
async function getSearchHistory() {
  try {
    const result = await chrome.storage.local.get("searchHistory");
    return result.searchHistory || [];
  } catch {
    return [];
  }
}

async function saveSearchToHistory(query) {
  if (!query || !currentSettings.saveSearchHistory) return;

  try {
    let history = await getSearchHistory();
    // Remove duplicate if exists
    history = history.filter((item) => item !== query);
    // Add to beginning
    history.unshift(query);
    // Limit to maxSearchHistory
    const maxItems = currentSettings.maxSearchHistory || 10;
    history = history.slice(0, maxItems);
    await chrome.storage.local.set({ searchHistory: history });
  } catch (error) {
    console.error("Failed to save search history:", error);
  }
}

// Debounce function for input handling
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Get all bookmarks from categories (flattened)
function getAllBookmarks() {
  const categories = bookmarkCategories || defaultBookmarkCategories;
  if (!categories) return [];

  const bookmarks = [];
  categories.forEach((category) => {
    if (category.bookmarks) {
      category.bookmarks.forEach((bookmark) => {
        bookmarks.push({
          name: bookmark.name,
          url: bookmark.url,
          category: category.name,
        });
      });
    }
  });
  return bookmarks;
}

// Get local matches for the query
async function getLocalMatches(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  // Match search history
  if (currentSettings.saveSearchHistory) {
    const history = await getSearchHistory();
    history.forEach((item) => {
      const lowerItem = item.toLowerCase();
      const matchIndex = lowerItem.indexOf(lowerQuery);
      if (matchIndex !== -1) {
        results.push({
          type: "history",
          text: item,
          url: null,
          matchIndex: matchIndex,
          matchLength: query.length,
        });
      }
    });
  }

  // Match bookmarks (name and URL)
  const bookmarks = getAllBookmarks();
  bookmarks.forEach((bookmark) => {
    const lowerName = bookmark.name.toLowerCase();
    const lowerUrl = bookmark.url.toLowerCase();

    // Try to match name first
    let matchIndex = lowerName.indexOf(lowerQuery);
    if (matchIndex !== -1) {
      results.push({
        type: "bookmark",
        text: bookmark.name,
        url: bookmark.url,
        category: bookmark.category,
        matchIndex: matchIndex,
        matchLength: query.length,
      });
    } else {
      // Try to match URL
      matchIndex = lowerUrl.indexOf(lowerQuery);
      if (matchIndex !== -1) {
        results.push({
          type: "bookmark",
          text: bookmark.name,
          url: bookmark.url,
          category: bookmark.category,
          matchIndex: -1, // URL match, no highlight on name
          matchLength: query.length,
        });
      }
    }
  });

  // Sort: exact matches first, then by match position
  results.sort((a, b) => {
    // Exact match priority
    const aExact = a.text.toLowerCase() === lowerQuery;
    const bExact = b.text.toLowerCase() === lowerQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // History items first when same match position
    if (a.type === "history" && b.type !== "history") return -1;
    if (a.type !== "history" && b.type === "history") return 1;

    // Earlier match position is better
    if (a.matchIndex !== b.matchIndex) {
      if (a.matchIndex === -1) return 1;
      if (b.matchIndex === -1) return -1;
      return a.matchIndex - b.matchIndex;
    }

    return 0;
  });

  // Limit results
  return results.slice(0, 10);
}

// Highlight matching text
function highlightMatch(text, matchIndex, matchLength) {
  if (matchIndex === -1 || matchLength === 0) {
    return escapeHtml(text);
  }
  const before = escapeHtml(text.substring(0, matchIndex));
  const match = escapeHtml(
    text.substring(matchIndex, matchIndex + matchLength),
  );
  const after = escapeHtml(text.substring(matchIndex + matchLength));
  return `${before}<mark class="search-match">${match}</mark>${after}`;
}

function createSearchSuggestionsDropdown(searchInput, searchContainer) {
  // Create dropdown element
  let dropdown = document.getElementById("search-history-dropdown");
  if (!dropdown) {
    dropdown = document.createElement("ul");
    dropdown.id = "search-history-dropdown";
    dropdown.className = "search-history-dropdown";
    searchContainer.appendChild(dropdown);
  }
  return dropdown;
}

// Show search history (when input is empty)
async function showSearchHistory(searchInput, dropdown) {
  // Check focus BEFORE async operation
  if (document.activeElement !== searchInput) {
    dropdown.style.display = "none";
    return;
  }

  if (!currentSettings.saveSearchHistory) {
    dropdown.style.display = "none";
    return;
  }

  const history = await getSearchHistory();

  // Check focus AGAIN after async operation (user may have clicked away)
  if (document.activeElement !== searchInput) {
    dropdown.style.display = "none";
    return;
  }

  if (history.length === 0) {
    dropdown.style.display = "none";
    return;
  }

  dropdown.innerHTML = history
    .map(
      (item) =>
        `<li class="search-history-item" data-type="history">${escapeHtml(item)}</li>`,
    )
    .join("");

  dropdown.style.display = "block";

  // Add mousedown handlers
  dropdown.querySelectorAll(".search-history-item").forEach((li, index) => {
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const query = history[index];
      saveSearchToHistory(query);
      navigateToUrl(
        buildSearchUrl(searchInput.form, searchInput, query),
        currentSettings.linkTarget,
      );
    });
  });
}

// Show search suggestions (when input has content)
async function showSearchSuggestions(searchInput, dropdown, query) {
  // Check focus BEFORE async operation
  if (document.activeElement !== searchInput) {
    dropdown.style.display = "none";
    return;
  }

  const matches = await getLocalMatches(query);

  // Check focus AGAIN after async operation (user may have clicked away)
  if (document.activeElement !== searchInput) {
    dropdown.style.display = "none";
    return;
  }

  if (matches.length === 0) {
    dropdown.style.display = "none";
    return;
  }

  dropdown.innerHTML = matches
    .map((match) => {
      const typeClass =
        match.type === "bookmark"
          ? "search-bookmark-item"
          : "search-history-item";
      const typeIcon = match.type === "bookmark" ? "🔖" : "🕐";
      const highlightedText = highlightMatch(
        match.text,
        match.matchIndex,
        match.matchLength,
      );

      return `<li class="${typeClass}" data-type="${match.type}" data-url="${match.url || ""}">
            <span class="suggestion-icon">${typeIcon}</span>
            <span class="suggestion-text">${highlightedText}</span>
        </li>`;
    })
    .join("");

  dropdown.style.display = "block";

  // Add mousedown handlers
  dropdown.querySelectorAll("li").forEach((li, index) => {
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const match = matches[index];

      if (match.type === "bookmark" && match.url) {
        // Navigate directly to bookmark URL
        navigateToUrl(match.url, currentSettings.linkTarget);
      } else {
        // Search for the history item
        saveSearchToHistory(match.text);
        navigateToUrl(
          buildSearchUrl(searchInput.form, searchInput, match.text),
          currentSettings.linkTarget,
        );
      }
    });
  });
}

function hideSuggestions(dropdown) {
  if (dropdown) {
    dropdown.style.display = "none";
    // Reset selected index when hiding
    dropdown.dataset.selectedIndex = "-1";
  }
}

function navigateToUrl(url, target = currentSettings.linkTarget || "_blank") {
  if (target === "_self") {
    window.location.assign(url);
    return;
  }

  window.open(url, target, "noopener");
}

function buildSearchUrl(searchForm, searchInput, query) {
  const url = new URL(searchForm.action);
  url.searchParams.set(searchInput.name, query);
  return url.toString();
}

// Keyboard navigation for dropdown
function handleDropdownKeyboard(e, searchInput, dropdown, searchForm) {
  if (dropdown.style.display === "none") return false;

  const items = dropdown.querySelectorAll("li");
  if (items.length === 0) return false;

  let selectedIndex = parseInt(dropdown.dataset.selectedIndex || "-1");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, -1);
  } else if (e.key === "Enter" && selectedIndex >= 0) {
    e.preventDefault();
    items[selectedIndex].dispatchEvent(new MouseEvent("mousedown"));
    return true;
  } else {
    return false;
  }

  // Update visual selection
  items.forEach((item, i) => {
    item.classList.toggle("selected", i === selectedIndex);
  });
  dropdown.dataset.selectedIndex = selectedIndex.toString();

  // Update input value to show selected item text
  if (selectedIndex >= 0) {
    const textEl = items[selectedIndex].querySelector(".suggestion-text");
    if (textEl) {
      // Store original value if not stored
      if (!searchInput.dataset.originalValue) {
        searchInput.dataset.originalValue = searchInput.value;
      }
      searchInput.value = textEl.textContent;
    } else {
      // For history items without .suggestion-text
      if (!searchInput.dataset.originalValue) {
        searchInput.dataset.originalValue = searchInput.value;
      }
      searchInput.value = items[selectedIndex].textContent;
    }
  } else {
    // Restore original value when going back up
    if (searchInput.dataset.originalValue !== undefined) {
      searchInput.value = searchInput.dataset.originalValue;
      delete searchInput.dataset.originalValue;
    }
  }

  return true;
}

// escapeHtml is loaded from js/utils.js

// Search setup
function setupSearch() {
  const searchForm = document.querySelector("#search form");
  const searchInput = document.getElementById("q");
  const searchContainer = document.getElementById("search");

  if (searchForm && searchInput && searchContainer) {
    const dropdown = createSearchSuggestionsDropdown(
      searchInput,
      searchContainer,
    );
    dropdown.dataset.selectedIndex = "-1";

    // Debounced search suggestion handler
    const debouncedSearch = debounce(async (query) => {
      if (query.trim()) {
        await showSearchSuggestions(searchInput, dropdown, query.trim());
      } else {
        await showSearchHistory(searchInput, dropdown);
      }
      // Reset selection when results change
      dropdown.dataset.selectedIndex = "-1";
    }, 200);

    // Helper function to show dropdown based on current input value
    const showDropdownIfNeeded = () => {
      if (!searchInput.value.trim()) {
        showSearchHistory(searchInput, dropdown);
      } else {
        showSearchSuggestions(searchInput, dropdown, searchInput.value.trim());
      }
    };

    // Show dropdown on click (not focus) - this prevents dropdown from showing
    // when focus comes from browser UI like bookmark bar
    searchInput.addEventListener("click", showDropdownIfNeeded);

    // Hide suggestions immediately on blur
    searchInput.addEventListener("blur", () => {
      hideSuggestions(dropdown);
      delete searchInput.dataset.originalValue;
    });

    // Keyboard navigation for dropdown
    searchInput.addEventListener("keydown", (e) => {
      if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
        handleDropdownKeyboard(e, searchInput, dropdown, searchForm);
      }
    });

    // Debounced input handling
    searchInput.addEventListener("input", () => {
      delete searchInput.dataset.originalValue; // Clear stored value on manual input
      debouncedSearch(searchInput.value);
    });

    // Save search and clear input on submit
    searchForm.addEventListener("submit", () => {
      const query = searchInput.value.trim();
      if (query) {
        saveSearchToHistory(query);
      }
      // Clear input with a small delay to allow form submission to process
      setTimeout(() => {
        searchInput.value = "";
      }, 10);
    });

    // Clear input and remove focus on page load/show (handles back button navigation/bfcache)
    window.addEventListener("pageshow", () => {
      searchInput.value = "";
      // Prevent browser from restoring focus on refresh
      searchInput.blur();
    });

    // Remove focus when switching back to this tab (only if input is empty)
    // This prevents disrupting user input while allowing clean state on tab switch
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !searchInput.value.trim()) {
        searchInput.blur();
      }
    });
  }
}

// Initialize
async function traichu() {
  // Load and apply settings first
  const settings = await loadSettings();

  // Render content
  if (settings.showDateTime) {
    startDateTime();
  }
  renderDock();
  renderBookmarks();
  setupSearch();

  // Setup drag reorder (only once per page load)
  setupDockDragReorder(document.getElementById("dock"));
  setupBookmarkDragReorder(document.getElementById("bookmarks"));

  // Apply settings (visibility, theme, search engine)
  applySettings(settings);

  // Reveal content with smooth transition
  requestAnimationFrame(() => {
    document.body.classList.add("loaded");
  });
}

// Listen for storage changes (for real-time updates when settings change)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    // Reload settings and reapply
    loadSettings().then((settings) => {
      // Re-render content if dock or bookmarks changed
      if (changes.dockSites || changes.showDockLabels || changes.linkTarget) {
        renderDock();
      }
      if (changes.bookmarkCategories || changes.linkTarget) {
        renderBookmarks();
      }

      applySettings(settings);

      if (changes.language && settings.showDateTime) {
        renderDateTime(true);
      }

      if (changes.showDateTime) {
        if (changes.showDateTime.newValue) {
          startDateTime();
        } else {
          stopDateTime();
        }
      }
    });
  }
});

// Event Listeners
window.addEventListener("DOMContentLoaded", () => {
  traichu();
  setupKeyboardShortcuts();
});
