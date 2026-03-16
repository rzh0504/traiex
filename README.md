# traiex

![traiex](favicon-32x32.png?raw=true)

> A minimal, beautiful, and customizable new tab page extension for Chrome/Edge browsers.

[中文文档](README_zh.md)

[Privacy Policy](privacy.html)

## ✨ Features

- **🕐 Time & Date Display** - Clean time display using your browser's current timezone, with Chinese and English date formats
- **🔍 Multi-Search Engine** - Google, Bing, DuckDuckGo, Baidu
- **🚀 Quick Access Dock** - Drag-and-drop customizable icon dock with preset sites
- **📚 Categorized Bookmarks** - Organize your bookmarks into categories with drag-and-drop reordering
- **🎨 Theme Support** - Light/Dark mode with system preference detection and custom background colors
- **🌐 Bilingual Interface** - Full Chinese and English language support
- **💾 Sync Storage** - All settings sync across your Chrome/Edge devices
- **📦 Import/Export** - Backup and restore all your settings and bookmarks

## 📸 Screenshots

| Dark Mode                                     | Light Mode                                     |
| --------------------------------------------- | ---------------------------------------------- |
| ![Dark Mode](https://i.imgur.com/ncQcCGy.jpg) | ![Light Mode](https://i.imgur.com/Gst8wfz.jpg) |

## 🚀 Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select the `traichu_ex` folder
5. Open a new tab to see traiex in action!

### Build for Distribution

No build step required! This extension uses vanilla HTML, CSS, and JavaScript.

## Privacy

- A privacy policy source page is included at `privacy.html`
- Before store submission, host that page at a public URL and use that URL in the store listing

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

### Appearance

- Theme mode (Auto/Light/Dark)
- Light mode background color (8 presets + custom color picker)
- Search box border radius (0-50px)
- Bookmark font weight

### Dock Settings

- Show/hide icon labels
- Add/remove sites from dock
- Drag to reorder dock icons

### Bookmark Management

- Create/rename/delete categories
- Add/remove bookmarks
- Drag to reorder categories and bookmarks

### Data Management

- Export all settings to JSON file
- Import settings from backup file

## 🔧 Keyboard Shortcuts

| Shortcut | Action             |
| -------- | ------------------ |
| `/`      | Focus search box   |
| `Escape` | Blur current input |

## 📁 Project Structure

```
traichu_ex/
├── assets/           # Search engine icons (SVG)
├── css/
│   ├── main.css      # Main page styles (imports others)
│   ├── styles.css    # Core styling
│   ├── vars.css      # CSS variables & themes
│   ├── reset.css     # CSS reset
│   └── options.css   # Settings page styles
├── js/
│   ├── main.js       # Main page logic
│   ├── options.js    # Settings page logic
│   ├── data.js       # Default presets & bookmarks
│   ├── utils.js      # Shared utilities & settings
│   └── i18n.js       # Internationalization
├── index.html        # New tab page
├── options.html      # Settings page
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
