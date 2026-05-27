# traiex

![traiex](favicon-32x32.png?raw=true)

> 一个简洁、美观、可定制的 Chrome/Edge 浏览器新标签页扩展。

[English Documentation](README.md)

[![Chrome Web Store](https://developer.chrome.com/static/docs/webstore/branding/image/206x58-chrome-web-043497a3d766e.png?hl=zh-cn)](https://chromewebstore.google.com/detail/traiex/nfigoaidbgeleohgbljdiicaoicleldl)

[![Edge Extension](https://user-images.githubusercontent.com/78568641/212470539-dd4d22a0-3af8-4fa7-9671-6df5b2e26a70.png)](https://microsoftedge.microsoft.com/addons/detail/traiex/kkjpkdokebijgkakacnogeckbikahoko)

## ✨ 功能特点

- **🕐 时间日期显示** - 使用浏览器当前时区显示时间，并支持中英文日期格式
- **🔍 跟随 Chrome 默认搜索** - 搜索始终使用 Chrome 当前默认搜索引擎
- **🚀 快捷访问 Dock** - 内置预设站点库，可添加/删除站点、显示图标标签，并支持拖拽排序
- **📚 分类书签** - 书签可按分类组织，支持分类重命名、分类排序、书签跨分类拖拽
- **✋ 长按排序** - 在新标签页中长按 Dock 图标或书签即可进入排序模式，桌面端和触屏端都可用
- **🎨 主题支持** - 浅色/深色模式，支持跟随系统，可自定义背景色
- **🎛️ 细节可定制** - 支持搜索框圆角、书签字重、模块显示开关、Dock/书签链接打开方式等设置
- **🌐 双语界面** - 完整的中英文语言支持
- **💾 设置可同步** - 设置可通过 Chrome/Edge 账号存储进行同步
- **📦 导入/导出** - 支持备份和恢复所有设置、Dock 站点和书签
- **📱 触屏友好编辑** - Dock、书签和分类在移动端同样支持拖拽调整

## 📸 截图预览

| 深色模式                                                                      | 浅色模式                                                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ![深色模式](https://s3.hi168.com/hi168-25959-33617kcp/traiex/traiex-dark.png) | ![浅色模式](https://s3.hi168.com/hi168-25959-33617kcp/traiex/traiex-light.png) |

## 🚀 安装方法

### 从源码安装（开发者模式）

1. 克隆此仓库并安装依赖：`pnpm install`
2. 构建目标浏览器产物：Chrome 使用 `pnpm build`，Edge 使用 `pnpm build:edge`
3. 打开 Chrome/Edge 浏览器，进入 `chrome://extensions/`（或 `edge://extensions/`）
4. 开启右上角的**开发者模式**
5. 点击**加载已解压的扩展程序**，选择 `.output/chrome-mv3` 或 `.output/edge-mv3`
6. 打开新标签页即可看到 traiex！

### 发布版本

本扩展已迁移为 WXT + Vue 工程。发布前请使用 `pnpm build` / `pnpm build:edge` 构建，或使用 `pnpm zip` / `pnpm zip:edge` 生成提交包。

## 隐私政策

- 仓库已提供隐私政策源文件：`public/privacy.html`

## ⚙️ 设置选项

点击页面右下角的 **⚙️ 设置按钮**，或右键点击扩展图标选择"选项"进行自定义：

### 显示设置

- 显示/隐藏时间日期
- 显示/隐藏 Dock
- 显示/隐藏书签
- 界面语言（中文/English）

### 外观设置

- 主题模式（跟随系统/浅色/深色）
- 浅色模式背景色（8 种预设 + 自定义颜色选择器）
- 搜索框圆角大小（0-50px）
- 书签字体粗细

### Dock 设置

- 显示/隐藏图标标签
- 添加/删除 Dock 站点
- 从内置预设快速添加站点
- 在设置页拖拽调整图标顺序
- 在新标签页长按后直接拖拽排序
- Dock 为空时自动隐藏

### 书签管理

- 创建/重命名/删除分类
- 添加/删除书签
- 防止重复网址被重复添加到不同分类
- 在设置页拖拽调整分类顺序
- 拖拽书签到其他分类或重新排序
- 在新标签页长按后直接拖拽排序

### 数据管理

- 导出所有设置为 JSON 文件
- 从备份文件导入设置
- 一键重置所有设置、Dock 站点和书签到默认状态
- 通过浏览器账号同步设置

## 🧭 使用提示

- 在新标签页长按 Dock 图标或书签可进入排序模式，然后拖拽调整顺序。
- 点击排序区域外部，或按 `Escape`，即可退出排序模式。

## 🔧 快捷键

| 快捷键   | 功能                        |
| -------- | --------------------------- |
| `/`      | 聚焦搜索框                  |
| `Escape` | 取消当前输入焦点 / 退出排序 |

## 📁 项目结构

```
traiex/
├── entrypoints/
│   ├── newtab/       # WXT 新标签页入口
│   └── options/      # WXT 设置页入口
├── public/           # 构建时原样复制的图标、字体、CSS、隐私页
├── types/            # 共享类型
├── utils/            # 设置、存储、i18n、搜索等共享逻辑
├── wxt.config.ts     # WXT manifest 与多浏览器配置
├── package.json
└── pnpm-lock.yaml
```

## 🛠️ 技术栈

- **WXT** - 工程化扩展框架，多浏览器 Manifest V3 构建
- **Vue 3** - 新标签页和设置页 UI
- **TypeScript** - 共享类型和业务逻辑
- **CSS3** - 复用原有 CSS 自定义属性、Flexbox、Grid、媒体查询
- **Chrome/Edge Storage Sync API** - 跨设备设置同步

## 📄 许可证

MIT 许可证 - 可自由使用、修改和分发。

## 🙏 致谢

- 原始项目 [Tressley/\_traichu](https://github.com/Tressley/_traichu)
- 字体：[Fira Code](https://fonts.google.com/specimen/Fira+Code)（通过 Google Fonts）
- Favicon 服务：[Google Favicon API](https://t0.gstatic.com/faviconV2)，并使用 [DuckDuckGo Icons API](https://icons.duckduckgo.com) 兜底
- 图标：来自 [Simple Icons](https://simpleicons.org/) 的内联 SVG
- 社区支持：[Linux.do](https://linux.do/)
