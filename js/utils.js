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
  searchBorderRadius: 8,
  bookmarksFontWeight: 550,
  linkTarget: "_blank", // '_blank' for new tab, '_self' for same tab
  showDockLabels: false, // Show text labels under dock icons
  language: "zh-CN", // 'zh-CN' for Chinese, 'en' for English
  saveSearchHistory: false, // Save search history locally
  maxSearchHistory: 10, // Maximum number of search history items
  dockSites: null,
};

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
