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
  } else {
    // Auto mode - apply light bg color if system is in light mode
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      applyLightBgColor(lightBgColor);
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
    timeZone: "Asia/Shanghai",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  };
}

function getDateOptions() {
  return {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };
}

let lastTimeString = "";

function dateTime() {
  const date = new Date();
  const locale = currentSettings.language || "zh-CN";
  const timeString = date.toLocaleTimeString(locale, getTimeOptions());
  const dateString = date.toLocaleDateString(locale, getDateOptions());

  // Only update DOM when values change (performance optimization)
  if (timeString !== lastTimeString) {
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

  // Calculate delay until next minute for efficiency (instead of checking every second)
  const now = new Date();
  const msUntilNextMinute =
    (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50; // +50ms buffer
  setTimeout(dateTime, msUntilNextMinute);
}

// Render Dock Sites
function renderDock() {
  const dockContainer = document.getElementById("dock");
  const ul = document.createElement("ul");

  // Add class for labels if enabled
  if (currentSettings.showDockLabels) {
    ul.classList.add("with-labels");
  }

  // Use docked sites from settings, fallback to global dockSites (from data.js) if available
  const sites =
    currentSettings.dockSites && currentSettings.dockSites.length > 0
      ? currentSettings.dockSites
      : typeof dockSites !== "undefined"
        ? dockSites
        : [];

  sites.forEach((site) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = site.url;
    a.innerHTML = site.svg;
    a.setAttribute("aria-label", site.name);
    a.setAttribute("title", site.name);
    a.target = currentSettings.linkTarget || "_blank";

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

// Render Bookmarks (categorized layout)
function renderBookmarks() {
  const bookmarksContainer = document.getElementById("bookmarks");
  bookmarksContainer.innerHTML = "";

  // Use stored categories or defaults
  const categories = bookmarkCategories || defaultBookmarkCategories;

  if (!categories || categories.length === 0) {
    return;
  }

  // Set data attribute for CSS to adjust layout based on column count
  bookmarksContainer.dataset.columns = categories.length;

  // Render each category as a column (ul)
  categories.forEach((category) => {
    const ul = document.createElement("ul");

    // Category name as first item (optional - styled differently)
    if (category.name) {
      const headerLi = document.createElement("li");
      headerLi.className = "category-header-item";
      headerLi.textContent = category.name;
      ul.appendChild(headerLi);
    }

    // Render bookmarks
    category.bookmarks.forEach((bookmark) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = bookmark.url;
      a.target = currentSettings.linkTarget || "_blank";

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
      const form = searchInput.form;
      const engine = form.action;
      const param = searchInput.name;
      window.location.href = `${engine}?${param}=${encodeURIComponent(query)}`;
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
        window.open(match.url, currentSettings.linkTarget || "_blank");
      } else {
        // Search for the history item
        saveSearchToHistory(match.text);
        const form = searchInput.form;
        const engine = form.action;
        const param = searchInput.name;
        window.location.href = `${engine}?${param}=${encodeURIComponent(match.text)}`;
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

    // Show history on focus (only if empty)
    searchInput.addEventListener("focus", () => {
      if (!searchInput.value.trim()) {
        showSearchHistory(searchInput, dropdown);
      } else {
        // Show suggestions for current value
        showSearchSuggestions(searchInput, dropdown, searchInput.value.trim());
      }
    });

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
    dateTime();
  }
  renderDock();
  renderBookmarks();
  setupSearch();

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

      // Special handling for dateTime - need to restart if turned on
      if (
        changes.showDateTime &&
        changes.showDateTime.newValue &&
        !changes.showDateTime.oldValue
      ) {
        dateTime();
      }
    });
  }
});

// Event Listeners
window.addEventListener("load", () => {
  traichu();
  setupKeyboardShortcuts();
});
