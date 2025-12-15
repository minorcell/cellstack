# CellStack - 工程师技术笔记

<p align="center">
  <img src="./public/logo.svg" width="120" height="120" alt="CellStack">
</p>

<p align="center">
  <strong>Engineering · Design · Intelligence</strong>
</p>

<p align="center">
  <a href="https://stack.mcell.top">🌐 在线访问</a> ·
  <a href="./README_en.md">English</a>
</p>

---

## 📖 关于项目

CellStack 是一个基于 Next.js 构建的现代化技术博客与个人作品集网站，专注于分享计算机科学的工程实践和个人思考。

**核心理念：** 追求速度、可维护性和出色的用户体验。

### ✨ 特性

- 📝 **技术博客** - 深度技术文章，涵盖前端、后端、DevOps、AI 等领域
- 📚 **主题学习** - 系统化的技术主题教程（如 Bun 等）
- 🎨 **现代设计** - 采用 Framer Motion 动画和精美的 UI 设计
- 🔍 **全文搜索** - 基于 Pagefind 的快速搜索功能
- 💬 **评论系统** - 集成 Giscus 实现 GitHub Discussions 评论
- 🌙 **响应式设计** - 完美适配各种设备尺寸
- 🎮 **3D 效果** - 使用 React Three Fiber 和 R3F 实现交互式 3D 效果
- 📊 **GitHub 热力图** - 展示编码活动的可视化统计

## 🛠️ 技术栈

### 核心框架

- **Next.js 16** - React 框架，支持静态导出
- **React 19** - 最新版本的 React
- **TypeScript** - 类型安全的 JavaScript

### UI 与样式

- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **Framer Motion** - 流畅的动画库
- **Lucide React** - 现代化图标库

### 内容管理

- **MDX** - 支持 JSX 的 Markdown
- **Gray Matter** - 解析前置元数据
- **Remark GFM** - GitHub 风格的 Markdown
- **Rehype Highlight** - 代码高亮

### 3D 图形

- **Three.js** - 3D 图形库
- **React Three Fiber** - React 的 Three.js 渲染器
- **@react-three/drei** - R3F 实用工具集

### 其他功能

- **Pagefind** - 静态网站搜索
- **Giscus** - 基于 GitHub Discussions 的评论系统
- **Mermaid** - 图表和流程图支持

## 🚀 快速开始

### 环境要求

- Node.js 18+ 或更高版本
- pnpm（推荐）/ npm / yarn

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 开发

启动本地开发服务器：

```bash
pnpm dev
# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

### 构建

构建生产版本：

```bash
pnpm build
# 或
npm run build
```

构建完成后，静态文件将输出到 `out/` 目录。

### 本地预览

预览构建后的网站：

```bash
pnpm start
# 或
npm start
```

### 代码格式化

```bash
# 检查代码格式
pnpm format:check

# 自动格式化代码
pnpm format
```

### 代码检查

```bash
pnpm lint
```

## 📁 项目结构

```
cellstack/
├── content/              # 内容文件
│   ├── blog/            # 博客文章（按年份组织）
│   └── topics/          # 主题教程
├── public/              # 静态资源
├── src/
│   ├── app/             # Next.js App Router 页面
│   │   ├── blog/       # 博客页面
│   │   ├── topics/     # 主题页面
│   │   ├── me/         # 个人介绍页面
│   │   └── search/     # 搜索页面
│   ├── components/      # React 组件
│   ├── lib/            # 工具函数和配置
│   └── types/          # TypeScript 类型定义
├── next.config.ts       # Next.js 配置
├── tailwind.config.ts   # Tailwind CSS 配置
└── tsconfig.json        # TypeScript 配置
```

## 📝 内容编写

### 博客文章

在 `content/blog/YYYY/` 目录下创建 Markdown 文件：

```markdown
---
date: 2025-01-01
title: 文章标题
description: 文章描述
author: mcell
tags:
  - 标签1
  - 标签2
keywords:
  - 关键词1
  - 关键词2
---

文章内容...
```

### 主题教程

在 `content/topics/主题名称/` 目录下创建 Markdown 文件。

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📬 联系方式

- **GitHub**: [@minorcell](https://github.com/minorcell)
- **邮箱**: minorcell6789@gmail.com
- **掘金**: [minorcell](https://juejin.cn/user/2280829967146779)
- **技术讨论**: 文章评论区

## 📄 License

本项目采用 [MIT](./LICENSE) 许可证。

---

<p align="center">
  使用 ❤️ 和 ☕ 构建
</p>
