# CellStack - Engineer's Technical Notes

<p align="center">
  <img src="./public/logo.svg" width="120" height="120" alt="CellStack">
</p>

<p align="center">
  <strong>Engineering · Design · Intelligence</strong>
</p>

<p align="center">
  <a href="https://stack.mcell.top">🌐 Live Site</a> ·
  <a href="./README.md">中文</a>
</p>

---

## 📖 About

CellStack is a modern tech blog and personal portfolio built with Next.js, focusing on sharing engineering practices in computer science and personal insights.

**Core Philosophy:** Pursuing speed, maintainability, and excellent user experience.

### ✨ Features

- 📝 **Tech Blog** - In-depth technical articles covering frontend, backend, DevOps, AI, and more
- 📚 **Topic Tutorials** - Systematic technical tutorials (e.g., Bun, etc.)
- 🎨 **Modern Design** - Featuring Framer Motion animations and beautiful UI design
- 🔍 **Full-Text Search** - Fast search powered by Pagefind
- 💬 **Comment System** - GitHub Discussions integration via Giscus
- 🌙 **Responsive Design** - Perfect adaptation for all device sizes
- 🎮 **3D Effects** - Interactive 3D effects using React Three Fiber and R3F
- 📊 **GitHub Heatmap** - Visual statistics of coding activity

## 🛠️ Tech Stack

### Core Frameworks

- **Next.js 16** - React framework with static export support
- **React 19** - Latest version of React
- **TypeScript** - Type-safe JavaScript

### UI & Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animation library
- **Lucide React** - Modern icon library

### Content Management

- **MDX** - Markdown with JSX support
- **Gray Matter** - Front matter parser
- **Remark GFM** - GitHub Flavored Markdown
- **Rehype Highlight** - Code syntax highlighting

### 3D Graphics

- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - R3F utility collection

### Other Features

- **Pagefind** - Static site search
- **Giscus** - Comment system based on GitHub Discussions
- **Mermaid** - Diagram and flowchart support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or higher
- pnpm (recommended) / npm / yarn

### Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Development

Start the local development server:

```bash
pnpm dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the site.

### Build

Build for production:

```bash
pnpm build
# or
npm run build
```

After building, static files will be output to the `out/` directory.

### Preview

Preview the built site locally:

```bash
pnpm start
# or
npm start
```

### Code Formatting

```bash
# Check code formatting
pnpm format:check

# Auto-format code
pnpm format
```

### Linting

```bash
pnpm lint
```

## 📁 Project Structure

```
cellstack/
├── content/              # Content files
│   ├── blog/            # Blog posts (organized by year)
│   └── topics/          # Topic tutorials
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── blog/       # Blog pages
│   │   ├── topics/     # Topic pages
│   │   ├── me/         # About me page
│   │   └── search/     # Search page
│   ├── components/      # React components
│   ├── lib/            # Utility functions and configs
│   └── types/          # TypeScript type definitions
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 📝 Writing Content

### Blog Posts

Create Markdown files in the `content/blog/YYYY/` directory:

```markdown
---
date: 2025-01-01
title: Post Title
description: Post description
author: mcell
tags:
  - Tag1
  - Tag2
keywords:
  - Keyword1
  - Keyword2
---

Post content...
```

### Topic Tutorials

Create Markdown files in the `content/topics/topic-name/` directory.

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📬 Contact

- **GitHub**: [@minorcell](https://github.com/minorcell)
- **Email**: minorcell6789@gmail.com
- **Juejin**: [minorcell](https://juejin.cn/user/2280829967146779)
- **Tech Discussions**: Comment sections of posts

## 📄 License

This project is licensed under the [MIT](./LICENSE) License.

---

<p align="center">
  Built with ❤️ and ☕
</p>
