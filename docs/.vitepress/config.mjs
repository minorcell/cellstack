import { withMermaid } from "vitepress-plugin-mermaid";

const defaultTheme = {
  base: "/",
  title: "CellStack - 工程师技术笔记",
  titleTemplate: ":title | CellStack",
  description:
    "专业的全栈工程师技术笔记分享平台，涵盖前端开发、后端架构、DevOps运维、AI工程实践。从零基础到项目落地，提供实战经验和最佳实践指南。",

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "CellStack",

    nav: [
      {
        text: "我",
        link: "/me/",
        activeMatch: "/me/",
      },
      {
        text: "博客",
        link: "/blog/",
        activeMatch: "/blog/",
      },
      {
        text: "收录",
        link: "/transpond/",
        activeMatch: "/transpond/",
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
          text: "思考",
          items: [
            { text: "编程的未来：从“翻译”到“意图”", link: "/blog/2025/13_codeinfeature" },
          ]
        },
        {
          text: "服务端",
          items: [
            { text: "从 Sleep 到 Select：用一个例子掌握 Go 并发编程精髓", link: "/blog/2025/09_goprintnum" },
            { text: "深度剖析 WebSocket：全双工实时通信原理与实战", link: "/blog/2025/08_ws" },
            { text: "深入浅出哈希算法：原理、应用与哈希表解析", link: "/blog/2025/06_hash" },
          ],
        },
        {
          text: "客户端",
          items: [
            { text: "JavaScript 运行机制详解：再谈 Event Loop", link: "/blog/2025/10_jssync" },
            { text: "探索 JS 异步编程：从 setTimeout 到生成器的六种定时实现", link: "/blog/2025/03_jsprintnum" },
            { text: "Vue 样式隔离与动态绑定的工程实践", link: "/blog/2025/01_vuestyle" },
            { text: "IndexedDB 前端数据库实战指南", link: "/blog/2024/01_indexdb" },
            { text: "VSCode 自动化代码规范实践指南", link: "/blog/2025/02_vscodeformat" },
          ],
        },
        {
          text: "AI 工程",
          items: [
            { text: "Claude Code Sub-agent 模式的详解和实践", link: "/blog/2025/12_subagent" },
            { text: "提示工程（Prompt Engineering）入门指南", link: "/blog/2025/11_prompt" },
          ],
        },
        {
          text: "安全与网络",
          items: [
            { text: "HTTP 状态码：15 个常见的状态码详解", link: "/blog/2025/04_httpcode" },
          ],
        },
        {
          text: "系统运维",
          items: [
            { text: "精通 Linux：开发者必备的 50 个核心命令行工具", link: "/blog/2025/07_linuxcmd" },
            { text: "项目配置管理的进化之路：从混乱到工程化", link: "/blog/2025/05_projectconfig" },
          ],
        },
      ],
      "/me/": [
        {
          text: "关于我",
          items: [
            { text: "介绍", link: "/me/" },
            { text: "技术写作核心规范：单线结构法则", link: "/me/01_write" }
          ],
        },
      ],
      "/transpond/": [
        {
          text: "收录",
          items: [
            { text: "介绍", link: "/transpond/" },
            { text: "写作类", link: "/transpond/01_write" }
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/minorcell/cellstack" },
    ],

    footer: {
      message: `累计提供服务 <span id="busuanzi_value_site_pv" ></span> 次`,
      copyright: `© ${new Date().getFullYear()} Created by mcell 豫ICP备2025129196号-1`,
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


  head: [
    // Favicon 优化
    ["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }],
    [
      "link",
      { rel: "apple-touch-icon", href: "/logo.svg", sizes: "180x180" },
    ],

    // 基础SEO Meta标签
    [
      "meta",
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ],
    ["meta", { name: "theme-color", content: "#8b7355" }],
    ["meta", { name: "author", content: "minorcell" }],
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
        content: "https://stack.mcell.top/logo.svg",
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
        content: "https://stack.mcell.top/logo.svg",
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
            url: "https://stack.mcell.top/logo.svg",
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

  appearance: "dark",
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
    image: {
      lazyLoading: true
    },
  },
  mermaid: {
    // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
  },
  mermaidPlugin: {
    class: "mermaid",
  },
};

export default withMermaid({
  ...defaultTheme
});
