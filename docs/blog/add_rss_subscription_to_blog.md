---
title: 为博客添加 RSS 订阅
description: 基于 vitepress-plugin-rss 集成 RSS，构建时自动生成 feed.xml，支持筛选博客目录与 SEO 发现，过程简洁可靠。
author: mcell
tags:
  - VitePress
  - RSS
  - 博客
  - 插件
  - 静态站点
keywords:
  - RSS 订阅
  - VitePress RSS
  - vitepress-plugin-rss
  - feed.xml
  - 静态博客
  - 订阅源发现
---

![062.png](https://stack-mcell.tos-cn-shanghai.volces.com/062.png)

# 为博客添加 RSS 订阅

> 我时常关注一些博客、技术论坛或者公众号，但是每次阅读都很麻烦：因为我需要在不同网站或者平台间来回切换，甚至有些平台插入了不少的广告。

为了更高效地聚合我所关注的博客和新闻源，我最近开始使用一个名为 [Folo](https://folo.is/) 的信息聚合应用。在探索 Folo 的过程中，我认识了 RSS——一种经典但依旧强大的信息同步协议。

![059.png](https://stack-mcell.tos-cn-shanghai.volces.com/059.png)

这让我萌生了一个想法：我的个人博客 [CellStack](https://stack.mcell.top/) 是使用 VitePress 构建的，能不能也成为一个 RSS 源，让我的内容可以被其他人和聚合器轻松订阅呢？

答案是肯定的。而且，借助社区现成的插件，整个过程异常简单，几乎只需要进行一些配置即可。

## 什么是 RSS

你可能在很多网站上见过这个长得像 WIFI 的橙色的图标。

<center><img src="https://stack-mcell.tos-cn-shanghai.volces.com/058.png" alt="RSS"></img></center>

RSS（Really Simple Syndication）是一种格式规范，用于发布和聚合网页内容的更新。可以让用户通过 RSS 阅读器（如 Folo、Feedly）订阅自己感兴趣的网站。一旦网站发布了新内容，订阅者就能在他们的阅读器中即时收到更新，而无需一次又一次地访问原始网站。

这就像是你订阅了你喜欢的 Up 主，他更新了视频，平台就会自动推送给你一样。对于内容创作者来说，RSS 提供了一种绝佳的方式，将自己的更新直接推送给最忠实的读者。

> 关于更多 RSS 的内容请看这篇帖子：[高效获取信息，你需要这份 RSS 入门指南](https://sspai.com/post/56391)

## 使用 `vitepress-plugin-rss`

VitePress 的生态系统非常活跃，对于生成 RSS 这种常见的需求，社区已经有了成熟的解决方案：`vitepress-plugin-rss`。这个插件可以无缝集成到 VitePress 的构建流程中，自动根据你的内容生成 `feed.xml`。

下面，我们来看看集成的具体步骤。

> 相关 commit：[feat(docs): 集成 RSS 订阅功能并配置相关插件](https://github.com/minorcell/cellstack/commit/465e54fdc29a307140a474638d230951233d4f71)

### **步骤一：安装插件**

首先，使用你偏好的包管理器将插件安装为开发依赖。

```bash
# 使用 npm
npm i vitepress-plugin-rss -D

# 或使用 pnpm
pnpm add vitepress-plugin-rss -D
```

### **步骤二：在 VitePress 配置中启用插件**

接下来是核心步骤。打开你的 VitePress 配置文件（通常是 `.vitepress/config.js` 或 `.vitepress/config.mjs`），引入插件并进行配置。

```javascript
// .vitepress/config.mjs

import { defineConfig } from "vitepress"
import { RssPlugin } from "vitepress-plugin-rss"

// RSS 插件配置
const RSS = {
  title: "CellStack - 工程师技术笔记",
  description:
    "计算机科学的工程实践和个人思考。涵盖前端开发、后端架构、DevOps运维、AI工程等技术领域的深度文章和实战经验分享。",
  baseUrl: "https://stack.mcell.top",
  url: "https://stack.mcell.top/feed.xml", // RSS feed 的完整 URL
  filename: "feed.xml", // 生成的文件名
  copyright: `© ${new Date().getFullYear()} mCell`,
  language: "zh-cn",
  author: {
    name: "mCell",
    link: "https://stack.mcell.top",
  },
  // 关键：通过过滤器精确控制哪些内容需要被收录
  // 这里我们只收录 'blog' 目录下的文章
  filter: (post) => post.url && post.url.startsWith("/blog/"),
}

export default defineConfig({
  // ... 你的其他站点配置

  vite: {
    plugins: [
      RssPlugin(RSS), // 将插件实例挂载到 Vite
    ],
  },
})
```

**配置要点解析：**

- **`filter` 过滤器**：这是我认为最实用的一个配置。通过一个简单的函数，你可以精确地控制哪些页面应该被包含在 RSS Feed 中。在我的配置里，我只希望将 `/blog/` 目录下的文章分享出去，像“关于”页面、首页等就不需要收录。这个函数很好地满足了这一需求。

### 步骤三：让订阅源可以被发现

最后，我们需要做两件小事来确保浏览器、爬虫和 RSS 阅读器能够顺利地找到你的订阅源。

**1. 添加 `<head>` 链接**

在 VitePress 的配置中，通过 `head` 选项添加一个 `<link>` 标签。这是一种标准的方式，用于向外界声明你的网站拥有一个 RSS feed。

```javascript
// .vitepress/config.mjs

export default defineConfig({
  // ...
  head: [
    [
      "link",
      {
        rel: "alternate",
        type: "application/rss+xml",
        href: "/feed.xml", // 确保这里的路径与插件配置中的 filename 对应
        title: "CellStack RSS Feed",
      },
    ],
  ],
  // ...
})
```

**2. 更新 `robots.txt`**

如果你的网站根目录 `public` 文件夹下有 `robots.txt` 文件，建议明确允许爬虫抓取你的 feed 文件。这有助于搜索引擎和其他服务发现并索引你的 RSS 源。

```txt
# public/robots.txt

User-agent: *
Allow: /
# ... 其他规则

Allow: /feed.xml
```

完成以上步骤后，重新构建并部署你的网站。现在，一个与你的博客内容实时同步的 RSS 源已经成功上线了！你可以将 `https://你的域名/feed.xml` 这个地址添加到 Folo 或任何你喜欢的 RSS 阅读器中，亲自体验一下订阅自己创作的乐趣。

比如这里，我的 FOLO 订阅了 CellStack 的 RSS 源之后，就可以看到 CellStack 的最新内容：
![063.png](https://stack-mcell.tos-cn-shanghai.volces.com/063.png)

## 结语

相比于手动编写脚本，使用 `vitepress-plugin-rss` 插件无疑是一种更高效、更可靠的方式。它将复杂的 RSS 规范封装起来，我们只需要关心清晰的配置项即可。

这不仅是一次简单的技术实践，更是对内容传播渠道的一次拓展。在这个算法推荐盛行的时代，RSS 这种看似“古老”的协议，却赋予了我们——无论是读者还是创作者——更多的主动权。它建立了一条纯粹的、无干扰的桥梁，连接了内容和真正关心它的人。

如果你也在使用 VitePress，强烈推荐你花几分钟时间，为你的站点也加上这个小而强大的功能。

（完）
