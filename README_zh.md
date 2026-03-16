# traiex

![traiex](favicon-32x32.png?raw=true)

> 一个简洁、美观、可定制的 Chrome/Edge 浏览器新标签页扩展。

[English Documentation](README.md)

[隐私政策](privacy.html)

## ✨ 功能特点

- **🕐 时间日期显示** - 使用浏览器当前时区显示时间，并支持中英文日期格式
- **🔍 多搜索引擎** - 支持 Google、Bing、DuckDuckGo、百度
- **🚀 快捷访问 Dock** - 可拖拽排序的图标 Dock，包含预设站点
- **📚 分类书签** - 将书签组织成分类，支持拖拽重新排序
- **🎨 主题支持** - 浅色/深色模式，支持跟随系统，可自定义背景色
- **🌐 双语界面** - 完整的中英文语言支持
- **💾 同步存储** - 所有设置通过 Chrome/Edge 账户同步
- **📦 导入/导出** - 备份和恢复所有设置和书签

## 📸 截图预览

| 深色模式                                     | 浅色模式                                     |
| -------------------------------------------- | -------------------------------------------- |
| ![深色模式](https://i.imgur.com/ncQcCGy.jpg) | ![浅色模式](https://i.imgur.com/Gst8wfz.jpg) |

## 🚀 安装方法

### 从源码安装（开发者模式）

1. 克隆或下载此仓库
2. 打开 Chrome/Edge 浏览器，进入 `chrome://extensions/`（或 `edge://extensions/`）
3. 开启右上角的**开发者模式**
4. 点击**加载已解压的扩展程序**，选择 `traichu_ex` 文件夹
5. 打开新标签页即可看到 traiex！

### 发布版本

无需构建！本扩展使用原生 HTML、CSS 和 JavaScript。

## 隐私政策

- 仓库已提供隐私政策源文件：`privacy.html`
- 正式提交到扩展商店前，请先把该页面部署到公开可访问的 URL，并将该 URL 填入商店后台

## ⚙️ 设置选项

点击页面右下角的 **⚙️ 设置按钮**，或右键点击扩展图标选择"选项"进行自定义：

### 显示设置

- 显示/隐藏时间日期
- 显示/隐藏 Dock
- 显示/隐藏书签
- 界面语言（中文/English）

### 搜索设置

- 默认搜索引擎（Google、Bing、DuckDuckGo、百度）
- 链接打开方式（新标签页或当前标签页）

### 外观设置

- 主题模式（跟随系统/浅色/深色）
- 浅色模式背景色（8 种预设 + 自定义颜色选择器）
- 搜索框圆角大小（0-50px）
- 书签字体粗细

### Dock 设置

- 显示/隐藏图标标签
- 添加/删除 Dock 站点
- 拖拽调整图标顺序

### 书签管理

- 创建/重命名/删除分类
- 添加/删除书签
- 拖拽调整分类和书签顺序

### 数据管理

- 导出所有设置为 JSON 文件
- 从备份文件导入设置

## 🔧 快捷键

| 快捷键   | 功能             |
| -------- | ---------------- |
| `/`      | 聚焦搜索框       |
| `Escape` | 取消当前输入焦点 |

## 📁 项目结构

```
traichu_ex/
├── assets/           # 搜索引擎图标 (SVG)
├── css/
│   ├── main.css      # 主页样式（导入其他文件）
│   ├── styles.css    # 核心样式
│   ├── vars.css      # CSS 变量和主题
│   ├── reset.css     # CSS 重置
│   └── options.css   # 设置页样式
├── js/
│   ├── main.js       # 主页逻辑
│   ├── options.js    # 设置页逻辑
│   ├── data.js       # 默认预设和书签
│   ├── utils.js      # 共享工具函数和设置
│   └── i18n.js       # 国际化
├── index.html        # 新标签页
├── options.html      # 设置页面
└── manifest.json     # 扩展清单 (v3)
```

## 🛠️ 技术栈

- **HTML5** - 语义化标记
- **CSS3** - CSS 自定义属性、Flexbox、Grid、媒体查询
- **原生 JavaScript** - 无框架，ES6+
- **Chrome Extension Manifest V3**
- **Chrome Storage Sync API** - 跨设备设置同步

## 📄 许可证

MIT 许可证 - 可自由使用、修改和分发。

## 🙏 致谢

- 原始项目 [Tressley/\_traichu](https://github.com/Tressley/_traichu)
- 字体：[Fira Code](https://fonts.google.com/specimen/Fira+Code)（通过 Google Fonts）
- Favicon 服务：[DuckDuckGo Icons API](https://icons.duckduckgo.com)
- 图标：来自 [Simple Icons](https://simpleicons.org/) 的内联 SVG
