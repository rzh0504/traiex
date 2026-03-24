// defaultSettings and getFaviconUrl are loaded from js/utils.js

const searchApi = globalThis.chrome?.search || globalThis.browser?.search || null;

// Default bookmark categories are loaded from js/data.js

// Current settings (loaded from storage)
let currentSettings = { ...defaultSettings };
let bookmarkCategories = null;
let dateTimeTimerId = null;
let currentDateLocale = "";
let timeFormatter = null;
let dateFormatter = null;
let isNavigatingAway = false;

// Load settings from storage
async function loadSettings() {
  try {
    const result = await appStorage.sync.get({
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

  const searchInput = document.getElementById("q");

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

function shouldHandleSameTabNavigation(event) {
  return (
    currentSettings.linkTarget === "_self" &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function preparePageForNavigation() {
  if (isNavigatingAway) return;
  isNavigatingAway = true;

  const resolvedBg = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary-background-color")
    .trim();
  const fallbackBg = getComputedStyle(document.body).backgroundColor;
  const backgroundColor = resolvedBg || fallbackBg;

  document.documentElement.style.backgroundColor = backgroundColor;
  document.body.style.backgroundColor = backgroundColor;
  document.body.style.opacity = "1";
  document.body.classList.remove("loaded");
  document.body.classList.add("navigating");
}

function navigateCurrentTab(url) {
  preparePageForNavigation();
  requestAnimationFrame(() => {
    window.location.assign(url);
  });
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
  const sites = Array.isArray(currentSettings.dockSites)
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
    a.addEventListener("click", function (event) {
      if (
        shouldHandleSameTabNavigation(event) &&
        !dockContainer.classList.contains("dock-edit-mode")
      ) {
        event.preventDefault();
        navigateCurrentTab(site.url);
        return;
      }

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
  let pointerDownTarget = null;
  let pointerDownX = 0;
  let pointerDownY = 0;
  let suppressNextClick = false;

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
    appStorage.sync.set({ dockSites: newSites }).catch((error) => {
      console.error("Failed to save dock order:", error);
    });
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
    if (!li || (e.pointerType === "mouse" && e.button !== 0)) return;

    pointerDownTarget = li;
    pointerDownX = e.clientX;
    pointerDownY = e.clientY;

    cancelLongPress();
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      if (pointerDownTarget !== li) return;
      enterEditMode();
      suppressNextClick = true;
      // Prevent the upcoming click from navigating
      li.querySelector("a")?.addEventListener("click", preventClick, {
        once: true,
      });
    }, LONG_PRESS_DURATION);
  });

  dockContainer.addEventListener("pointerup", () => {
    cancelLongPress();
    pointerDownTarget = null;
  });
  dockContainer.addEventListener("pointercancel", () => {
    cancelLongPress();
    pointerDownTarget = null;
  });
  dockContainer.addEventListener("pointerleave", () => {
    cancelLongPress();
    pointerDownTarget = null;
  });
  dockContainer.addEventListener("pointermove", (e) => {
    // Cancel long press if pointer moves too much (allow small jitter)
    if (!longPressTimer) return;
    const dx = Math.abs(e.clientX - pointerDownX);
    const dy = Math.abs(e.clientY - pointerDownY);
    if (dx > 8 || dy > 8) {
      cancelLongPress();
      pointerDownTarget = null;
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
    const originalIndex = Array.from(ul.children).indexOf(dragSrcEl);

    if (e.clientX < midX) {
      ul.insertBefore(dragSrcEl, li);
    } else {
      ul.insertBefore(dragSrcEl, li.nextSibling);
    }

    const newIndex = Array.from(ul.children).indexOf(dragSrcEl);
    if (newIndex !== originalIndex) {
      saveNewOrder();
    }
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
      if (suppressNextClick) {
        suppressNextClick = false;
        const a = e.target.closest("#dock a");
        if (a) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

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
      a.addEventListener("click", function (event) {
        if (
          shouldHandleSameTabNavigation(event) &&
          !bookmarksContainer.classList.contains("bookmark-edit-mode")
        ) {
          event.preventDefault();
          navigateCurrentTab(bookmark.url);
          return;
        }

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
    appStorage.sync.set({ bookmarkCategories: newCategoriesData }).catch(
      (error) => {
        console.error("Failed to save bookmark order:", error);
      },
    );
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

function navigateToUrl(url, target = currentSettings.linkTarget || "_blank") {
  if (target === "_self") {
    window.location.assign(url);
    return;
  }

  window.open(url, target, "noopener");
}

async function queryDefaultSearchProvider(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return false;
  }

  if (!searchApi?.query) {
    console.error("Chrome Search API is unavailable.");
    return false;
  }

  try {
    await searchApi.query({
      text: trimmedQuery,
      disposition: "CURRENT_TAB",
    });
    return true;
  } catch (error) {
    console.error("Failed to search via Chrome default provider:", error);
    return false;
  }
}

// Search setup
function setupSearch() {
  const searchForm = document.querySelector("#search form");
  const searchInput = document.getElementById("q");
  if (searchForm && searchInput) {
    // Submit directly via Chrome's default search provider
    searchForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const query = searchInput.value.trim();
      if (!query) return;

      await queryDefaultSearchProvider(query);
      searchInput.value = "";
      searchInput.blur();
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

  // Apply settings (visibility, theme, search box styling)
  applySettings(settings);

  // Reveal content with smooth transition
  requestAnimationFrame(() => {
    document.body.classList.add("loaded");
  });
}

// Listen for storage changes (for real-time updates when settings change)
appStorage.onChanged.addListener((changes, namespace) => {
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
