# traiex - AI Coding Agent Instructions

## Project Overview

traiex 是一个 Chrome/Edge 浏览器新标签页扩展，使用纯 HTML/CSS/JavaScript（无构建步骤）。使用 Manifest V3，通过 `chrome.storage.sync` 同步设置。

## Architecture

```
index.html      → 新标签页主页面（覆盖 chrome_url_overrides.newtab）
options.html    → 设置页面（options_ui）
js/
├── utils.js    → 共享工具函数 + defaultSettings（单一配置源）
├── data.js     → 默认数据配置（dockSites、bookmarkCategories）
├── i18n.js     → 国际化翻译字典（zh-CN/en）
├── main.js     → 主页逻辑（时间、搜索、渲染）
└── options.js  → 设置页逻辑（表单、拖拽、导入导出）
css/
├── vars.css    → CSS 变量（颜色、字体、主题）
├── styles.css  → 主页样式
└── options.css → 设置页样式
```

**脚本加载顺序**：`utils.js` → `data.js` → `main.js/options.js`（共享变量依赖）

## Key Conventions

### Settings Management

- **单一配置源**：所有默认设置定义在 [js/utils.js](js/utils.js) 的 `defaultSettings` 对象
- **存储 API**：使用 `chrome.storage.sync.get/set`，支持跨设备同步
- **设置自动保存**：options.js 使用 debounce 机制自动保存

```javascript
// 读取设置示例
const result = await chrome.storage.sync.get({
  ...defaultSettings,
  bookmarkCategories: null,
});
```

### Internationalization (i18n)

- 双语支持：`zh-CN`（默认）和 `en`
- 翻译定义在 [js/i18n.js](js/i18n.js) 的 `translations` 对象
- HTML 使用 `data-i18n` 属性标记可翻译文本：`<label data-i18n="show_dock">显示 Dock</label>`
- 添加新文本时，必须在两个语言中都添加对应的 key

### Theme System

- 三种模式：`auto`（跟随系统）、`light`、`dark`
- 主题类：`theme-light`、`theme-dark` 添加到 `<html>`
- CSS 变量定义在 [css/vars.css](css/vars.css)，使用 HSL 格式便于程序化控制
- 浅色模式支持自定义背景色（8 预设 + 自定义）

### Dock & Bookmarks

- Dock 站点使用内联 SVG 图标（定义在 `data.js` 的 `dockSitePresets`）
- 书签使用 DuckDuckGo favicon 服务：`getFaviconUrl(url)` in utils.js
- 分类限制：2-4 个（`MIN_CATEGORIES`/`MAX_CATEGORIES` in options.js）
- 支持拖拽排序（桌面端 drag API + 移动端 touch 事件）

### Search Engines

搜索引擎配置在 [js/main.js](js/main.js)：

```javascript
const searchEngines = {
  google: { name: "Google", url: "https://www.google.com/search", param: "q" },
  baidu: { name: "百度", url: "https://www.baidu.com/s", param: "wd" }, // 注意 param 差异
};
```

图标 SVG 文件在 `assets/` 目录，通过 CSS 变量 `--svg-{engine}` 引用。

## Development

**无需构建** - 直接在浏览器 `chrome://extensions/` 加载解压的扩展目录即可调试。

**调试方式**：

- 主页：打开新标签页
- 设置页：右键扩展图标 → "选项"，或直接访问 `options.html`

**测试清单**：

- [ ] 设置修改后刷新主页验证生效
- [ ] 中英文切换后所有文本正确显示
- [ ] 亮/暗主题切换正常
- [ ] 拖拽排序在桌面和移动端都可用

## Code Patterns

### 添加新设置项

1. 在 `js/utils.js` 的 `defaultSettings` 添加默认值
2. 在 `options.html` 添加 UI 元素（含 `data-i18n` 属性）
3. 在 `js/i18n.js` 的两个语言中添加翻译
4. 在 `js/options.js` 添加读取/保存逻辑
5. 在 `js/main.js` 的 `applySettings()` 中应用设置

### XSS 防护

使用 `escapeHtml()` 函数处理用户输入：

```javascript
const safeText = escapeHtml(userInput); // 定义在 utils.js
```

### 键盘快捷键

定义在 `js/utils.js` 的 `setupKeyboardShortcuts()`：

- `/` 聚焦搜索框
- `Escape` 取消焦点
