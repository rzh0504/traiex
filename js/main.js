// defaultSettings and getFaviconUrl are loaded from js/utils.js

// Search engine configurations
const searchEngines = {
    google: { name: 'Google', url: 'https://www.google.com/search', param: 'q' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search', param: 'q' },
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/', param: 'q' },
    baidu: { name: '百度', url: 'https://www.baidu.com/s', param: 'wd' }
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
            dockSites: null
        });
        currentSettings = result;
        bookmarkCategories = result.bookmarkCategories;
        return result;
    } catch (error) {
        console.error('Failed to load settings:', error);
        return defaultSettings;
    }
}

// Apply settings to the page
function applySettings(settings) {
    // Apply visibility settings
    const dateTimeSection = document.getElementById('date-time');
    const dockSection = document.getElementById('dock');
    const bookmarksSection = document.getElementById('bookmarks');

    if (dateTimeSection) {
        dateTimeSection.style.display = settings.showDateTime ? '' : 'none';
    }
    if (dockSection) {
        dockSection.style.display = settings.showDock ? '' : 'none';
    }
    if (bookmarksSection) {
        bookmarksSection.style.display = settings.showBookmarks ? '' : 'none';
        // Add extra margin when dock is hidden
        bookmarksSection.style.marginTop = settings.showDock ? '' : '2rem';
    }

    // Apply search engine
    const searchForm = document.querySelector('#search form');
    const searchInput = document.getElementById('q');
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
        searchInput.style.borderRadius = settings.searchBorderRadius + 'px';
    }
    
    // Apply bookmarks font weight
    if (settings.bookmarksFontWeight !== undefined) {
        document.documentElement.style.setProperty('--bookmarks-font-weight', settings.bookmarksFontWeight);
    }

    // Apply theme
    applyTheme(settings.theme, settings.lightBgColor);
}

// Apply theme mode
function applyTheme(theme, lightBgColor) {
    const root = document.documentElement;
    
    // Remove any existing theme class
    root.classList.remove('theme-light', 'theme-dark');
    
    if (theme === 'light') {
        root.classList.add('theme-light');
        applyLightBgColor(lightBgColor);
    } else if (theme === 'dark') {
        root.classList.add('theme-dark');
    } else {
        // Auto mode - apply light bg color if system is in light mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            applyLightBgColor(lightBgColor);
        }
    }
}

// Apply custom light mode background color
function applyLightBgColor(color) {
    if (color && color !== '#DDE2EF') {
        document.documentElement.style.setProperty('--primary-background-color', color);
    } else {
        document.documentElement.style.removeProperty('--primary-background-color');
    }
}

// Time/Date formatting functions
function getTimeOptions() {
    return { 
        timeZone: 'Asia/Shanghai', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    };
}

function getDateOptions() {
    return { 
        timeZone: 'Asia/Shanghai', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
    };
}

let lastTimeString = '';

function dateTime() {
    const date = new Date();
    const locale = currentSettings.language || 'zh-CN';
    const timeString = date.toLocaleTimeString(locale, getTimeOptions());
    const dateString = date.toLocaleDateString(locale, getDateOptions());
    
    // Only update DOM when values change (performance optimization)
    if (timeString !== lastTimeString) {
        const timeEl = document.getElementById('time');
        const dateEl = document.getElementById('date');
        
        // Create elements if they don't exist yet
        if (!timeEl || !dateEl) {
            const container = document.getElementById('date-time');
            container.innerHTML = '<p id="time"></p><p id="date"></p>';
        }
        
        document.getElementById('time').textContent = timeString;
        document.getElementById('date').textContent = dateString;
        lastTimeString = timeString;
    }
    
    setTimeout(dateTime, 1000);
}

// Render Dock Sites
function renderDock() {
    const dockContainer = document.getElementById('dock');
    const ul = document.createElement('ul');
    
    // Add class for labels if enabled
    if (currentSettings.showDockLabels) {
        ul.classList.add('with-labels');
    }

    // Use docked sites from settings, fallback to global dockSites (from data.js) if available
    const sites = (currentSettings.dockSites && currentSettings.dockSites.length > 0) 
        ? currentSettings.dockSites 
        : (typeof dockSites !== 'undefined' ? dockSites : []);

    sites.forEach(site => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = site.url;
        a.innerHTML = site.svg;
        a.setAttribute('aria-label', site.name);
        a.setAttribute('title', site.name);
        a.target = currentSettings.linkTarget || '_blank';
        
        // Add label if enabled
        if (currentSettings.showDockLabels) {
            const label = document.createElement('span');
            label.className = 'dock-label';
            label.textContent = site.name;
            a.appendChild(label);
        }
        
        li.appendChild(a);
        ul.appendChild(li);
    });

    dockContainer.innerHTML = '';
    dockContainer.appendChild(ul);
}

// Render Bookmarks (4-column categorized layout)
function renderBookmarks() {
    const bookmarksContainer = document.getElementById('bookmarks');
    bookmarksContainer.innerHTML = '';
    
    // Use stored categories or defaults
    const categories = bookmarkCategories || defaultBookmarkCategories;
    
    if (!categories || categories.length === 0) {
        return;
    }
    
    // Render each category as a column (ul)
    categories.forEach(category => {
        const ul = document.createElement('ul');
        
        // Category name as first item (optional - styled differently)
        if (category.name) {
            const headerLi = document.createElement('li');
            headerLi.className = 'category-header-item';
            headerLi.textContent = category.name;
            ul.appendChild(headerLi);
        }
        
        // Render bookmarks
        category.bookmarks.forEach(bookmark => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = bookmark.url;
            a.target = currentSettings.linkTarget || '_blank';
            
            const img = document.createElement('img');
            img.src = getFaviconUrl(bookmark.url);
            img.className = 'favicon';
            img.alt = bookmark.name + ' favicon';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.onerror = function() { this.style.display = 'none'; };
            
            a.appendChild(img);
            a.appendChild(document.createTextNode(bookmark.name));
            
            // Remove focus on click/touch for mobile (CSS :focus-visible handles desktop)
            a.addEventListener('click', function() { this.blur(); });
            
            li.appendChild(a);
            ul.appendChild(li);
        });
        
        bookmarksContainer.appendChild(ul);
    });
}

// Search history functions
async function getSearchHistory() {
    try {
        const result = await chrome.storage.local.get('searchHistory');
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
        history = history.filter(item => item !== query);
        // Add to beginning
        history.unshift(query);
        // Limit to maxSearchHistory
        const maxItems = currentSettings.maxSearchHistory || 10;
        history = history.slice(0, maxItems);
        await chrome.storage.local.set({ searchHistory: history });
    } catch (error) {
        console.error('Failed to save search history:', error);
    }
}

function createSearchHistoryDropdown(searchInput, searchContainer) {
    // Create dropdown element
    let dropdown = document.getElementById('search-history-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('ul');
        dropdown.id = 'search-history-dropdown';
        dropdown.className = 'search-history-dropdown';
        searchContainer.appendChild(dropdown);
    }
    return dropdown;
}

async function showSearchHistory(searchInput, dropdown) {
    if (!currentSettings.saveSearchHistory) {
        dropdown.style.display = 'none';
        return;
    }
    
    const history = await getSearchHistory();
    if (history.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = history.map(item => 
        `<li class="search-history-item">${escapeHtml(item)}</li>`
    ).join('');
    
    dropdown.style.display = 'block';
    
    // Add mousedown handlers (fires before blur, so we can handle selection before hiding)
    dropdown.querySelectorAll('.search-history-item').forEach((li, index) => {
        li.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent blur from firing
            const query = history[index];
            // Save to history again (moves to top)
            saveSearchToHistory(query);
            // Navigate directly instead of setting input value (prevents browser remembering value)
            const form = searchInput.form;
            const engine = form.action;
            const param = searchInput.name;
            window.location.href = `${engine}?${param}=${encodeURIComponent(query)}`;
        });
    });
}

function hideSearchHistory(dropdown) {
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Escape HTML helper (if not already available from utils.js)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search setup
function setupSearch() {
    const searchForm = document.querySelector('#search form');
    const searchInput = document.getElementById('q');
    const searchContainer = document.getElementById('search');

    if (searchForm && searchInput && searchContainer) {
        const dropdown = createSearchHistoryDropdown(searchInput, searchContainer);
        
        // Show history on focus
        searchInput.addEventListener('focus', () => {
            showSearchHistory(searchInput, dropdown);
        });
        
        // Hide history immediately on blur
        searchInput.addEventListener('blur', () => {
            hideSearchHistory(dropdown);
        });
        
        // Hide history when typing
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim()) {
                hideSearchHistory(dropdown);
            } else {
                showSearchHistory(searchInput, dropdown);
            }
        });
        
        // Save search and clear input on submit
        searchForm.addEventListener('submit', () => {
            const query = searchInput.value.trim();
            if (query) {
                saveSearchToHistory(query);
            }
            // Clear input immediately to prevent browser remembering value
            searchInput.value = '';
        });
        
        // Clear input on page load/show (handles back button navigation)
        searchInput.value = '';
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
        document.body.classList.add('loaded');
    });
}

// Listen for storage changes (for real-time updates when settings change)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        // Reload settings and reapply
        loadSettings().then(settings => {
            // Re-render content if dock or bookmarks changed
            if (changes.dockSites || changes.showDockLabels || changes.linkTarget) {
                renderDock();
            }
            if (changes.bookmarkCategories || changes.linkTarget) {
                renderBookmarks();
            }
            
            applySettings(settings);
            
            // Special handling for dateTime - need to restart if turned on
            if (changes.showDateTime && changes.showDateTime.newValue && !changes.showDateTime.oldValue) {
                dateTime();
            }
        });
    }
});

// Event Listeners
window.addEventListener('load', () => {
    traichu();
    setupKeyboardShortcuts();
});
