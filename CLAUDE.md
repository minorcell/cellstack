# CellStack - 工程师技术笔记

## 项目简介

CellStack 是由 mCell（minorcell）维护的个人技术笔记网站，专注于计算机科学的工程实践和技术思考。网站使用 VitePress 构建，涵盖前端、后端、DevOps、AI 工程等多个技术领域。

**网站地址**: https://stack.mcell.top  
**GitHub**: https://github.com/minorcell/cellstack

## 技术栈

- **静态站点生成器**: VitePress 1.0.0
- **包管理器**: pnpm / npm
- **依赖项**:
  - `vitepress-plugin-mermaid`: Mermaid 图表支持
  - `vitepress-plugin-comment-with-giscus`: Giscus 评论系统
  - `medium-zoom`: 图片缩放功能
  - `cytoscape`: 图形可视化
  - `dayjs`: 时间处理
  - `html2canvas`: 截图功能
  - `qrcode`: 二维码生成

## 项目结构

```
cellstack/
├── docs/                    # 文档源码
│   ├── .vitepress/         # VitePress 配置
│   │   ├── config.mjs      # 主配置文件
│   │   └── theme/          # 主题定制
│   ├── blog/               # 技术博客
│   │   ├── 2024/          # 2024年文章
│   │   └── 2025/          # 2025年文章
│   ├── me/                 # 个人介绍
│   ├── transpond/          # 收录内容
│   ├── public/            # 静态资源
│   │   └── images/        # 图片资源
│   └── index.md           # 首页
├── package.json           # 项目依赖
└── pnpm-lock.yaml        # 锁定文件
```

## 核心功能

### 1. 技术博客系统
- **分类体系**: 思考、服务端、客户端、AI 工程、安全与网络、系统运维
- **主要文章**:
  - 编程的未来：从"翻译"到"意图"
  - Claude Code Sub-agent 模式详解和实践
  - JavaScript 运行机制详解
  - Go 并发编程
  - WebSocket 深度解析

### 2. 搜索和导航
- 本地搜索功能（中文优化）
- 响应式导航栏
- 文章目录导航（2-6级标题）
- 编辑链接（GitHub 集成）

### 3. SEO 优化
- 完整的 Meta 标签配置
- Open Graph 社交媒体优化
- Twitter Card 支持
- 结构化数据（JSON-LD）
- 站点地图自动生成
- Canonical URL 处理

### 4. 用户体验
- 暗色模式支持
- 图片懒加载和缩放
- 评论系统（Giscus）
- 访问统计（不蒜子）
- PWA 支持
- 移动端优化

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run docs:dev

# 构建生产版本
pnpm run docs:build

# 预览构建结果
pnpm run docs:serve
```

## 内容管理

### 博客文章格式
```yaml
---
title: 文章标题
description: 文章描述
author: mcell
tags: [标签1, 标签2]
---

# 文章标题

文章内容...
```

### 图片资源
- 路径: `/public/images/年份/`
- 格式: 支持 webp, jpg, png, avif
- 命名: 数字编号（如 001.jpg, 002.png）

## 部署信息

- **主分支**: main
- **域名**: stack.mcell.top
- **备案号**: 豫ICP备2025129196号-1

## 作者信息

- **作者**: mCell (minorcell)
- **技术栈**: TypeScript + Golang
- **专业**: DevOps 工程师
- **联系方式**:
  - GitHub: [@minorcell](https://github.com/minorcell)
  - 掘金: [@mCell](https://juejin.cn/user/2280829967146779)
  - 知乎: [@mCell](https://www.zhihu.com/people/yue-guang-luo-zai-zuo-shou-shang-49-70)
  - 邮箱: minorcell6789@gmail.com

## 特色内容

1. **AI 工程实践**: Sub-agent 模式、提示工程等前沿技术
2. **全栈开发**: JavaScript、Go、系统架构等
3. **工程化思维**: 项目配置、自动化工具、最佳实践
4. **深度技术解析**: Event Loop、哈希算法、WebSocket 等
5. **个人思考**: 编程的未来、技术写作等

## 开发注意事项

- 使用 VitePress 的最新特性
- 遵循 SEO 最佳实践
- 保持中文内容的本土化体验
- 注重移动端适配
- 重视页面加载性能