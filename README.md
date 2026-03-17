# traiex

![traiex](favicon-32x32.png?raw=true)

> A minimal, beautiful, and customizable new tab page extension for Chrome/Edge browsers.

[中文文档](README_zh.md)

## ✨ Features

- **🕐 Time & Date Display** - Clean time display using your browser's current timezone, with Chinese and English date formats
- **🔍 Multi-Search Engine** - Google, Bing, DuckDuckGo, Baidu, with configurable same-tab or new-tab opening
- **🧠 Local Search Suggestions** - Search history and bookmark matches appear as you type, with keyboard navigation support
- **🚀 Quick Access Dock** - Preset site library, add/remove management, optional labels, and drag-and-drop reordering
- **📚 Categorized Bookmarks** - Organize bookmarks into categories, rename categories inline, and drag to reorder categories or items
- **✋ Long-Press Reordering** - Long-press Dock icons or bookmarks on the new tab page to enter reorder mode on desktop and touch devices
- **🎨 Theme Support** - Light/Dark mode with system preference detection and custom background colors
- **🎛️ Fine-Grained Customization** - Search box radius, bookmark font weight, visibility toggles, and per-link target behavior
- **🌐 Bilingual Interface** - Full Chinese and English language support
- **💾 Sync + Local Storage** - Settings sync across Chrome/Edge devices, while optional search history stays local
- **📦 Import/Export** - Backup and restore all your settings, Dock sites, and bookmarks
- **📱 Touch-Friendly Editing** - Mobile drag handling is supported for Dock and bookmark/category management

## 📸 Screenshots

| Dark Mode                                                                      | Light Mode                                                                       |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| ![Dark Mode](https://s3.hi168.com/hi168-25959-33617kcp/traiex/traiex-dark.png) | ![Light Mode](https://s3.hi168.com/hi168-25959-33617kcp/traiex/traiex-light.png) |

## 🚀 Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select the `traiex` folder
5. Open a new tab to see traiex in action!

### Build for Distribution

No build step required! This extension uses vanilla HTML, CSS, and JavaScript.

## Privacy

- A privacy policy source page is included at `privacy.html`

## ⚙️ Configuration

Click the **⚙️ Settings** button (bottom right corner) or right-click the extension icon and select "Options" to customize:

### Display Settings

- Show/hide time & date
- Show/hide dock
- Show/hide bookmarks
- Interface language (Chinese/English)

### Search Settings

- Default search engine (Google, Bing, DuckDuckGo, Baidu)
- Link open behavior (new tab or current tab)
- Optional local search history
- Search history count limit
- Clear saved search history
- Live suggestions from saved history and existing bookmarks

### Appearance

- Theme mode (Auto/Light/Dark)
- Light mode background color (8 presets + custom color picker)
- Search box border radius (0-50px)
- Bookmark font weight

### Dock Settings

- Show/hide icon labels
- Add/remove sites from dock
- Add sites from built-in presets
- Drag to reorder dock icons in settings
- Long-press to reorder dock icons directly on the new tab page
- Auto-hide when the dock becomes empty

### Bookmark Management

- Create/rename/delete categories
- Add/remove bookmarks
- Prevent duplicate bookmark URLs across categories
- Drag to reorder categories in settings
- Drag to reorder bookmarks across categories
- Long-press to reorder bookmarks directly on the new tab page

### Data Management

- Export all settings to JSON file
- Import settings from backup file
- Reset all settings, Dock sites, and bookmarks to defaults
- Sync settings through browser account storage
- Keep search history local to the current device only

## 🧭 Usage Tips

- Long-press Dock icons or bookmarks on the new tab page to enter reorder mode, then drag to sort.
- Click outside the active reorder area or press `Escape` to exit reorder mode.
- Type in the search box to see bookmark/history suggestions, or focus the empty search box to see saved search history.
- Use arrow keys to navigate the suggestion list and press `Enter` to open the selected result.

## 🔧 Keyboard Shortcuts

| Shortcut            | Action                                           |
| ------------------- | ------------------------------------------------ |
| `/`                 | Focus search box                                 |
| `Escape`            | Blur current input / exit reorder mode           |
| `Arrow Up/Down`     | Navigate search suggestions or saved history     |
| `Enter`             | Open the selected suggestion                     |

## 📁 Project Structure

``` 
traiex/
├── assets/           # Search engine icons (SVG)
├── css/
│   ├── main.css      # Main page styles (imports others)
│   ├── styles.css    # Core styling
│   ├── vars.css      # CSS variables & themes
│   ├── reset.css     # CSS reset
│   ├── options.css   # Settings page styles
│   └── privacy.css   # Privacy page styles
├── js/
│   ├── main.js       # Main page logic
│   ├── options.js    # Settings page logic
│   ├── data.js       # Default presets & bookmarks
│   ├── utils.js      # Shared utilities & settings
│   └── i18n.js       # Internationalization
├── index.html        # New tab page
├── options.html      # Settings page
├── privacy.html      # Privacy policy page
└── manifest.json     # Extension manifest (v3)
```

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid, Media queries
- **Vanilla JavaScript** - No frameworks, ES6+
- **Chrome Extension Manifest V3**
- **Chrome Storage Sync API** - Cross-device settings sync

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Credits

- Original project [Tressley/\_traichu](https://github.com/Tressley/_traichu)
- Font: [Fira Code](https://fonts.google.com/specimen/Fira+Code) via Google Fonts
- Favicon service: [DuckDuckGo Icons API](https://icons.duckduckgo.com)
- Icons: Inline SVGs from [Simple Icons](https://simpleicons.org/)
