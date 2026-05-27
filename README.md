# traiex

![traiex](favicon-32x32.png?raw=true)

> A minimal, beautiful, and customizable new tab page extension for Chrome/Edge browsers.

> [中文文档](README_zh.md)

[![Chrome Web Store](https://developer.chrome.com/static/docs/webstore/branding/image/206x58-chrome-web-043497a3d766e.png?hl=en)](https://chromewebstore.google.com/detail/traiex/nfigoaidbgeleohgbljdiicaoicleldl)

[![Edge Extension](https://user-images.githubusercontent.com/78568641/212470539-dd4d22a0-3af8-4fa7-9671-6df5b2e26a70.png)](https://microsoftedge.microsoft.com/addons/detail/traiex/kkjpkdokebijgkakacnogeckbikahoko)

## ✨ Features

- **🕐 Time & Date Display** - Clean time display using your browser's current timezone, with Chinese and English date formats
- **🔍 Chrome Default Search** - Search always uses Chrome's current default search provider
- **🚀 Quick Access Dock** - Preset site library, add/remove management, optional labels, and drag-and-drop reordering
- **📚 Categorized Bookmarks** - Organize bookmarks into categories, rename categories inline, and drag to reorder categories or items
- **✋ Long-Press Reordering** - Long-press Dock icons or bookmarks on the new tab page to enter reorder mode on desktop and touch devices
- **🎨 Theme Support** - Light/Dark mode with system preference detection and custom background colors
- **🎛️ Fine-Grained Customization** - Search box radius, bookmark font weight, visibility toggles, and Dock/bookmark link behavior
- **🌐 Bilingual Interface** - Full Chinese and English language support
- **💾 Syncable Settings** - Settings sync across Chrome/Edge devices through browser storage
- **📦 Import/Export** - Backup and restore all your settings, Dock sites, and bookmarks
- **📱 Touch-Friendly Editing** - Mobile drag handling is supported for Dock and bookmark/category management

## 📸 Screenshots

| Dark Mode                                                                      | Light Mode                                                                       |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| ![Dark Mode](https://s3.hi168.com/hi168-25959-33617kcp/traiex/traiex-dark.png) | ![Light Mode](https://s3.hi168.com/hi168-25959-33617kcp/traiex/traiex-light.png) |

## 🚀 Installation

### From Source (Developer Mode)

1. Clone this repository and install dependencies: `pnpm install`
2. Build the target output: Chrome uses `pnpm build`, Edge uses `pnpm build:edge`
3. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
4. Enable **Developer mode** (toggle in top right)
5. Click **Load unpacked** and select `.output/chrome-mv3` or `.output/edge-mv3`
6. Open a new tab to see traiex in action!

### Build for Distribution

traiex is now a WXT + Vue extension project. Build with `pnpm build` / `pnpm build:edge`, or create store archives with `pnpm zip` / `pnpm zip:edge`.

## Privacy

- Privacy policy text for Google Docs is available at `docs/privacy-policy-google-docs.txt`

## ⚙️ Configuration

Click the **⚙️ Settings** button (bottom right corner) or right-click the extension icon and select "Options" to customize:

### Display Settings

- Show/hide time & date
- Show/hide dock
- Show/hide bookmarks
- Interface language (Chinese/English)

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

## 🧭 Usage Tips

- Long-press Dock icons or bookmarks on the new tab page to enter reorder mode, then drag to sort.
- Click outside the active reorder area or press `Escape` to exit reorder mode.

## 🔧 Keyboard Shortcuts

| Shortcut | Action                                 |
| -------- | -------------------------------------- |
| `/`      | Focus search box                       |
| `Escape` | Blur current input / exit reorder mode |

## 📁 Project Structure

```
traiex/
├── entrypoints/
│   ├── newtab/       # WXT new tab entrypoint
│   └── options/      # WXT options entrypoint
├── public/           # Icons, fonts, and CSS copied to builds
├── types/            # Shared types
├── utils/            # Shared settings, storage, i18n, and search logic
├── wxt.config.ts     # WXT manifest and browser-target config
├── package.json
└── pnpm-lock.yaml
```

## 🛠️ Tech Stack

- **WXT** - Extension framework with multi-browser Manifest V3 builds
- **Vue 3** - New tab and options UI
- **TypeScript** - Shared types and behavior
- **CSS3** - Existing custom properties, Flexbox, Grid, and media queries
- **Chrome/Edge Storage Sync API** - Cross-device settings sync

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Credits

- Original project [Tressley/\_traichu](https://github.com/Tressley/_traichu)
- Font: [Fira Code](https://fonts.google.com/specimen/Fira+Code) via Google Fonts
- Favicon service: [Google Favicon API](https://t0.gstatic.com/faviconV2) with [DuckDuckGo Icons API](https://icons.duckduckgo.com) fallback
- Icons: Inline SVGs from [Simple Icons](https://simpleicons.org/)
- Community Support: [Linux.do](https://linux.do/)
