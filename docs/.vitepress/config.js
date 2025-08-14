export default {
  base: "/",
  title: "CellStack - 工程师技术笔记",
  titleTemplate: ":title | CellStack",
  description:
    "专业的全栈工程师技术笔记分享平台，涵盖前端开发、后端架构、DevOps运维、AI工程实践。从零基础到项目落地，提供实战经验和最佳实践指南。",

  head: [
    // Favicon 优化
    ["link", { rel: "icon", href: "/logo-simple.svg", type: "image/svg+xml" }],
    [
      "link",
      { rel: "apple-touch-icon", href: "/logo-simple.svg", sizes: "180x180" },
    ],

    // 基础SEO Meta标签
    [
      "meta",
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ],
    ["meta", { name: "theme-color", content: "#8b7355" }],
    ["meta", { name: "author", content: "CellStack" }],
    ["meta", { name: "robots", content: "index, follow" }],
    ["meta", { name: "googlebot", content: "index, follow" }],

    // 关键词优化
    [
      "meta",
      {
        name: "keywords",
        content:
          "前端开发,后端开发,全栈工程师,DevOps,AI工程,技术笔记,编程教程,JavaScript,TypeScript,React,Vue,Node.js,Python,Go,Docker,Kubernetes,微服务,系统设计,算法,数据结构,最佳实践,项目实战,技术分享,工程师成长",
      },
    ],

    // Open Graph 社交媒体优化
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "CellStack" }],
    [
      "meta",
      { property: "og:title", content: "CellStack - 工程师技术笔记分享平台" },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "专业的全栈工程师技术笔记分享平台，涵盖前端、后端、DevOps、AI工程实践。从零基础到项目落地的完整学习路径。",
      },
    ],
    ["meta", { property: "og:url", content: "https://stack.mcell.top" }],
    [
      "meta",
      {
        property: "og:image",
        content: "https://stack.mcell.top/logo-simple.svg",
      },
    ],
    ["meta", { property: "og:image:width", content: "400" }],
    ["meta", { property: "og:image:height", content: "400" }],
    [
      "meta",
      { property: "og:image:alt", content: "CellStack - 工程师技术笔记平台" },
    ],
    ["meta", { property: "og:locale", content: "zh_CN" }],

    // Twitter Card 优化
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@cellstack" }],
    ["meta", { name: "twitter:creator", content: "@cellstack" }],
    ["meta", { name: "twitter:title", content: "CellStack - 工程师技术笔记" }],
    [
      "meta",
      {
        name: "twitter:description",
        content: "专业技术笔记分享平台，前端后端DevOps AI全栈实践指南",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://stack.mcell.top/logo-simple.svg",
      },
    ],
    ["meta", { name: "twitter:image:alt", content: "CellStack技术笔记平台" }],

    // 结构化数据 - Website Schema
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "CellStack",
        alternateName: "CellStack技术笔记",
        url: "https://stack.mcell.top",
        description:
          "专业的全栈工程师技术笔记分享平台，涵盖前端开发、后端架构、DevOps运维、AI工程实践",
        inLanguage: "zh-CN",
        author: {
          "@type": "Person",
          name: "CellStack",
          url: "https://github.com/minorcell",
        },
        publisher: {
          "@type": "Organization",
          name: "CellStack",
          logo: {
            "@type": "ImageObject",
            url: "https://stack.mcell.top/logo-simple.svg",
          },
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://stack.mcell.top/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }),
    ],

    // Performance 优化
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    ["link", { rel: "dns-prefetch", href: "https://github.com" }],

    // PWA 支持
    ["link", { rel: "manifest", href: "/manifest.json" }],
    ["meta", { name: "application-name", content: "CellStack" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    ],
    ["meta", { name: "apple-mobile-web-app-title", content: "CellStack" }],
    ["meta", { name: "mobile-web-app-capable", content: "yes" }],
    ["meta", { name: "msapplication-TileColor", content: "#8b7355" }],
    ["meta", { name: "msapplication-config", content: "/browserconfig.xml" }],

    // 安全和性能
    ["meta", { "http-equiv": "X-UA-Compatible", content: "IE=edge" }],
    ["meta", { name: "referrer", content: "no-referrer-when-downgrade" }],
  ],

  // 站点地图和SEO配置
  sitemap: {
    hostname: "https://stack.mcell.top",
  },

  appearance: "light",
  lastUpdated: true,
  cleanUrls: true,

  // 自定义页面元数据
  transformPageData(pageData) {
    const canonicalUrl = `https://stack.mcell.top${pageData.relativePath}`
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "");

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:url", content: canonicalUrl }],
    );
  },

  themeConfig: {
    logo: "/logo-simple.svg",
    siteTitle: "CellStack",

    nav: [
      {
        text: "博客",
        link: "/blog/",
        activeMatch: "/blog/",
      },
    ],

    sidebar: {
      "/blog/": [
        {
          text: "博客",
          items: [
            { text: "介绍", link: "/blog/" },
          ],
        },
        {
          text: "客户端",
          items: [
            { text: "JS Map 知多少：揭开键值对存储的隐秘角落", link: "/blog/2025/02_jsmap" },
            { text: "你不知道的 Vue Style 黑魔法", link: "/blog/2025/03_vuestyle" },
            { text: "Vue 自定义指令：揭开 DOM 操作的神秘面纱", link: "/blog/2025/05_vuedirective" },
            { text: "当浏览器也开始‘造轮子’：Web Components 的觉醒之旅", link: "/blog/2025/06_webcomponents" },
            { text: "每秒打印一个数字：从简单到晦涩的多种实现", link: "/blog/2025/07_jsprintnum" },
          ],
        },
        {
          text: "服务端",
          items: [
            { text: "项目配置管理的进化之路：从混乱到工程化", link: "/blog/2025/09_projectconfig" },
            { text: "为什么我们需要 .proto 文件", link: "/blog/2025/16_whyproto" },
            { text: "揭秘 Webhook 事件驱动机制", link: "/blog/2025/17_webhook" },
            { text: "为何百万 Goroutine 不卡，Worker Pool 如何榨干 CPU", link: "/blog/2025/18_goroutine" },
            { text: "那台榨汁机，竟是哈希表祖师爷？", link: "/blog/2025/19_hash" },
            { text: "告别轮询！深度剖析 WebSocket：全双工实时通信原理与实战", link: "/blog/2025/22_ws" },

          ],
        },
        {
          text: "安全与网络",
          items: [
            { text: "HTTP 状态码：15 个常见的状态码详解", link: "/blog/2025/08_httpcode" },
            { text: "你可能在用错密码：服务端密码安全的真相与陷阱", link: "/blog/2025/10_serverpwd" },
            { text: "密码的本质与误解，先打好基础，扫除认知盲区", link: "/blog/2025/11_pwdhashed" },
            { text: "从 MD5 到 Bcrypt：密码哈希的演进与实践", link: "/blog/2025/12_md5_bcrypt" },
            { text: "密码校验与攻击面：不再\"裸奔\"的防线", link: "/blog/2025/13_pwdflow" },
            { text: "密码重置机制：安全链条上不容忽视的一环", link: "/blog/2025/15_pwdreset" },
          ],
        },
        {
          text: "系统运维",
          items: [
            { text: "从删库到跑路？这 50 个 Linux 命令能保你职业生涯", link: "/blog/2025/20_linuxcmd" },
          ],
        },
        {
          text: "开发工具",
          items: [
            { text: "Hub-IO：输入 URL 获取 GitHub 贡献者信息，README 从此自带开发者画廊", link: "/blog/2025/01_hubio" },
            { text: "VSCode 自动格式化：ESLint 与 Prettier", link: "/blog/2025/04_vscodeformat" },
            { text: "【不演了，这篇文章是 AI 写的】我是如何用 Cursor 快速生成一个 Golang 新手教程的", link: "/blog/2025/14_curosrblog" },
            { text: "受够 Cursor 卡成蜗牛！我换用 Augment，每月白嫖 300 次真香！", link: "/blog/2025/21_augment" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/minorcell/cellstack" },
    ],

    footer: {
      message: "持续探索，用爱发电。",
      copyright: "Copyright © 2025 CellStack.",
    },

    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },

    search: {
      provider: "local",
      options: {
        placeholder: "搜索技术文档...",
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索技术文档",
          },
          modal: {
            searchBox: {
              resetButtonTitle: "清除查询条件",
              resetButtonAriaLabel: "清除查询条件",
              cancelButtonText: "取消",
              cancelButtonAriaLabel: "取消搜索",
            },
            startScreen: {
              recentSearchesTitle: "最近搜索",
              noRecentSearchesText: "暂无搜索历史",
              saveRecentSearchButtonTitle: "保存搜索历史",
              removeRecentSearchButtonTitle: "删除搜索历史",
              favoriteSearchesTitle: "收藏搜索",
              removeFavoriteSearchButtonTitle: "取消收藏",
            },
            errorScreen: {
              titleText: "搜索出错",
              helpText: "请检查网络连接或稍后重试",
            },
            footer: {
              selectText: "选择",
              navigateText: "导航",
              closeText: "关闭",
            },
            noResultsScreen: {
              noResultsText: "未找到相关内容",
              suggestedQueryText: "建议搜索：",
              reportMissingResultsText: "认为应该有结果？",
              reportMissingResultsLinkText: "提交反馈",
            },
          },
        },
      },
    },

    // 编辑链接
    editLink: {
      pattern: "https://github.com/minorcell/cellstack/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },

    // 导航增强
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    // 大纲配置
    outline: {
      level: [2, 6],
      label: "页面导航",
    },

    // 返回顶部
    returnToTopLabel: "返回顶部",

    // 侧边栏标题
    sidebarMenuLabel: "菜单",

    // 深色模式
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },

  // Markdown 配置优化
  markdown: {
    lineNumbers: true,
    container: {
      tipLabel: "提示",
      warningLabel: "注意",
      dangerLabel: "警告",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },
};
