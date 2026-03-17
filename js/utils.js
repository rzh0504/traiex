/**
 * Shared Utilities for traiex Extension
 */

// Default settings (single source of truth)
const defaultSettings = {
  showDateTime: true,
  showDock: true,
  showBookmarks: true,
  searchEngine: "google",
  theme: "auto",
  lightBgColor: "#DDE2EF",
  searchBorderRadius: 20,
  bookmarksFontWeight: 400,
  linkTarget: "_blank", // '_blank' for new tab, '_self' for same tab
  showDockLabels: false, // Show text labels under dock icons
  language: "zh-CN", // 'zh-CN' for Chinese, 'en' for English
  saveSearchHistory: false, // Save search history locally
  maxSearchHistory: 10, // Maximum number of search history items
  dockSites: null,
};

const storagePrefixes = {
  sync: "traiex:storage:sync",
  local: "traiex:storage:local",
};

const extensionStorage =
  globalThis.chrome?.storage || globalThis.browser?.storage || null;

const localStorageChangeListeners = new Set();

function cloneStorageValue(value) {
  if (value === undefined) return undefined;
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function getStorageBucket(area) {
  try {
    const raw = localStorage.getItem(storagePrefixes[area]);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error(`Failed to read ${area} storage:`, error);
    return {};
  }
}

function setStorageBucket(area, value) {
  localStorage.setItem(storagePrefixes[area], JSON.stringify(value));
}

function buildStorageResult(area, keys) {
  const bucket = getStorageBucket(area);

  if (keys == null) {
    return cloneStorageValue(bucket);
  }

  if (typeof keys === "string") {
    return { [keys]: cloneStorageValue(bucket[keys]) };
  }

  if (Array.isArray(keys)) {
    return keys.reduce((result, key) => {
      result[key] = cloneStorageValue(bucket[key]);
      return result;
    }, {});
  }

  if (typeof keys === "object") {
    return Object.entries(keys).reduce((result, [key, defaultValue]) => {
      result[key] =
        key in bucket ? cloneStorageValue(bucket[key]) : cloneStorageValue(defaultValue);
      return result;
    }, {});
  }

  return {};
}

function notifyLocalStorageListeners(changes, area) {
  if (!changes || Object.keys(changes).length === 0) {
    return;
  }

  localStorageChangeListeners.forEach((listener) => {
    try {
      listener(changes, area);
    } catch (error) {
      console.error("Storage listener failed:", error);
    }
  });
}

function diffStorageBuckets(previousBucket, nextBucket) {
  const changes = {};
  const keys = new Set([
    ...Object.keys(previousBucket || {}),
    ...Object.keys(nextBucket || {}),
  ]);

  keys.forEach((key) => {
    const oldValue = previousBucket?.[key];
    const newValue = nextBucket?.[key];
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = {
        oldValue: cloneStorageValue(oldValue),
        newValue: cloneStorageValue(newValue),
      };
    }
  });

  return changes;
}

function createLocalStorageArea(area) {
  return {
    async get(keys) {
      return buildStorageResult(area, keys);
    },
    async set(items) {
      const previousBucket = getStorageBucket(area);
      const nextBucket = { ...previousBucket, ...cloneStorageValue(items) };
      setStorageBucket(area, nextBucket);
      notifyLocalStorageListeners(
        diffStorageBuckets(previousBucket, nextBucket),
        area,
      );
    },
    async remove(keys) {
      const previousBucket = getStorageBucket(area);
      const nextBucket = { ...previousBucket };
      const keysToRemove = Array.isArray(keys) ? keys : [keys];

      keysToRemove.forEach((key) => {
        delete nextBucket[key];
      });

      setStorageBucket(area, nextBucket);
      notifyLocalStorageListeners(
        diffStorageBuckets(previousBucket, nextBucket),
        area,
      );
    },
    async clear() {
      const previousBucket = getStorageBucket(area);
      localStorage.removeItem(storagePrefixes[area]);
      notifyLocalStorageListeners(
        diffStorageBuckets(previousBucket, {}),
        area,
      );
    },
  };
}

const appStorage = extensionStorage
  ? {
      sync: extensionStorage.sync,
      local: extensionStorage.local,
      onChanged: extensionStorage.onChanged,
    }
  : {
      sync: createLocalStorageArea("sync"),
      local: createLocalStorageArea("local"),
      onChanged: {
        addListener(listener) {
          localStorageChangeListeners.add(listener);
        },
        removeListener(listener) {
          localStorageChangeListeners.delete(listener);
        },
      },
    };

window.addEventListener("storage", (event) => {
  const area = Object.entries(storagePrefixes).find(
    ([, key]) => key === event.key,
  )?.[0];

  if (!area) {
    return;
  }

  const previousBucket = event.oldValue ? JSON.parse(event.oldValue) : {};
  const nextBucket = event.newValue ? JSON.parse(event.newValue) : {};
  notifyLocalStorageListeners(diffStorageBuckets(previousBucket, nextBucket), area);
});

/**
 * Get favicon URL from a domain using DuckDuckGo's favicon service
 * @param {string} url - The full URL to extract domain from
 * @returns {string} - Favicon URL or empty string on error
 */
function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    return "";
  }
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML string
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Setup keyboard shortcuts for the page
 */
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Skip if IME composition is in progress (for Chinese/Japanese input methods)
    if (e.isComposing) return;

    // '/' key focuses search box and shows dropdown (when not already in an input)
    if (
      e.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      e.preventDefault();
      const searchInput = document.getElementById("q");
      if (searchInput) {
        searchInput.focus();
        // Dispatch a click event to trigger dropdown display
        searchInput.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    }

    // Escape key blurs current input
    if (
      e.key === "Escape" &&
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      document.activeElement.blur();
    }
  });
}
