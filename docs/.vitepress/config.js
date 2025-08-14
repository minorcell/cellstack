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
        text: "语言",
        link: "/language-basics/",
        activeMatch: "/language-basics/",
      },
      {
        text: "工程",
        link: "/project/",
        activeMatch: "/project/",
      },
      {
        text: "博客",
        link: "/blog/",
        activeMatch: "/blog/",
      },
    ],

    sidebar: {
      "/language-basics/": [
        {
          text: "语言",
          items: [
            { text: "概述", link: "/language-basics/" },
          ],
        },
      ],
      "/project/": [
        {
          text: "工程实践",
          items: [
            { text: "概述", link: "/project/" },
          ],
        },
      ],
      "/blog/": [
        {
          text: "博客",
          items: [
            { text: "所有文章", link: "/blog/" },
          ],
        },
        {
          text: "2025年文章",
          items: [
            {
              text: "Hub-IO：GitHub 贡献者信息工具",
              link: "/blog/2025/01_hubio",
            },
            { text: "JavaScript Map 使用全解析", link: "/blog/2025/02_jsmap" },
            { text: "Vue 样式绑定深度解析", link: "/blog/2025/03_vuestyle" },
            {
              text: "VS Code 代码格式化配置",
              link: "/blog/2025/04_vscodeformat",
            },
            {
              text: "Vue 自定义指令完全指南",
              link: "/blog/2025/05_vuedirective",
            },
            {
              text: "Web Components 深度解析",
              link: "/blog/2025/06_webcomponents",
            },
            {
              text: "JavaScript 数字精度处理",
              link: "/blog/2025/07_jsprintnum",
            },
            { text: "HTTP 状态码完全指南", link: "/blog/2025/08_httpcode" },
            {
              text: "项目配置文件最佳实践",
              link: "/blog/2025/09_projectconfig",
            },
            { text: "服务器密码管理策略", link: "/blog/2025/10_serverpwd" },
            { text: "密码哈希算法实战", link: "/blog/2025/11_pwdhashed" },
            {
              text: "MD5 vs BCrypt 安全对比",
              link: "/blog/2025/12_md5_bcrypt",
            },
            { text: "密码验证流程设计", link: "/blog/2025/13_pwdflow" },
            { text: "Cursor 博客开发体验", link: "/blog/2025/14_curosrblog" },
            { text: "密码重置功能实现", link: "/blog/2025/15_pwdreset" },
            { text: "为什么需要 .proto 文件", link: "/blog/2025/16_whyproto" },
            { text: "Webhook 事件驱动机制", link: "/blog/2025/17_webhook" },
            { text: "Goroutine 并发编程", link: "/blog/2025/18_goroutine" },
            { text: "哈希算法原理解析", link: "/blog/2025/19_hash" },
            { text: "Linux 命令行实战", link: "/blog/2025/20_linuxcmd" },
            { text: "Augment AI 编程工具", link: "/blog/2025/21_augment" },
            { text: "WebSocket 实时通信", link: "/blog/2025/22_ws" },
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
