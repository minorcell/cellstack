/**
 * Head 配置
 * SEO、Meta标签、社交媒体、PWA等配置
 */
export const head = [
  // ==================== Favicon ====================
  ["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }],
  ["link", { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }],
  ["link", { rel: "apple-touch-icon", href: "/logo.svg", sizes: "180x180" }],

  // ==================== 基础 SEO Meta 标签 ====================
  ["meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }],
  ["meta", { name: "theme-color", content: "#8b7355" }],
  ["meta", { name: "author", content: "minorcell" }],
  ["meta", { name: "robots", content: "index, follow" }],
  ["meta", { name: "googlebot", content: "index, follow" }],

  // ==================== 关键词优化 ====================
  [
    "meta",
    {
      name: "keywords",
      content:
        "CellStack,mCell,minorcell,技术博客,前端开发,后端开发,全栈工程师,DevOps,AI工程,技术笔记,编程教程,JavaScript,TypeScript,React,Vue,Node.js,Python,Go,Docker,Kubernetes,微服务,系统设计,算法,数据结构,最佳实践,项目实战,技术分享,工程师成长,Sub-agent,提示工程,WebSocket,哈希算法,Linux命令,HTTP状态码,IndexedDB,Vue样式管理,VSCode配置,Go并发编程",
    },
  ],

  // ==================== Open Graph 社交媒体优化 ====================
  ["meta", { property: "og:type", content: "website" }],
  ["meta", { property: "og:site_name", content: "CellStack" }],
  ["meta", { property: "og:title", content: "CellStack - 工程师技术笔记" }],
  [
    "meta",
    {
      property: "og:description",
      content:
        "计算机科学的工程实践和个人思考。涵盖前端开发、后端架构、DevOps运维、AI工程等技术领域的深度文章和实战经验分享。",
    },
  ],
  ["meta", { property: "og:url", content: "https://stack.mcell.top" }],
  ["meta", { property: "og:image", content: "https://stack.mcell.top/logo.svg" }],
  ["meta", { property: "og:image:width", content: "400" }],
  ["meta", { property: "og:image:height", content: "400" }],
  ["meta", { property: "og:image:alt", content: "CellStack - 工程师技术笔记" }],
  ["meta", { property: "og:locale", content: "zh_CN" }],

  // ==================== Twitter Card 优化 ====================
  ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ["meta", { name: "twitter:site", content: "@cellstack" }],
  ["meta", { name: "twitter:creator", content: "@cellstack" }],
  ["meta", { name: "twitter:title", content: "CellStack - 工程师技术笔记" }],
  [
    "meta",
    {
      name: "twitter:description",
      content: "计算机科学的工程实践和个人思考。涵盖前端开发、后端架构、DevOps运维、AI工程等技术领域的深度文章和实战经验分享。",
    },
  ],
  ["meta", { name: "twitter:image", content: "https://stack.mcell.top/logo.svg" }],
  ["meta", { name: "twitter:image:alt", content: "CellStack技术笔记平台" }],

  // ==================== 结构化数据 - Website Schema ====================
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
        "计算机科学的工程实践和个人思考。涵盖前端开发、后端架构、DevOps运维、AI工程等技术领域的深度文章和实战经验分享。",
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

  // ==================== Performance 优化 ====================
  ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
  ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
  ["link", { rel: "dns-prefetch", href: "https://github.com" }],

  // ==================== PWA 支持 ====================
  ["link", { rel: "manifest", href: "/manifest.json" }],
  ["meta", { name: "application-name", content: "CellStack" }],
  ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
  ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "default" }],
  ["meta", { name: "apple-mobile-web-app-title", content: "CellStack" }],
  ["meta", { name: "mobile-web-app-capable", content: "yes" }],
  ["meta", { name: "msapplication-TileColor", content: "#8b7355" }],
  ["meta", { name: "msapplication-config", content: "/browserconfig.xml" }],

  // ==================== 安全和性能 ====================
  ["meta", { "http-equiv": "X-UA-Compatible", content: "IE=edge" }],
  ["meta", { name: "referrer", content: "no-referrer-when-downgrade" }],

  // ==================== RSS 订阅源发现 ====================
  [
    "link",
    {
      rel: "alternate",
      type: "application/rss+xml",
      href: "/feed.xml",
      title: "CellStack RSS Feed",
    },
  ],

  // ==================== 搜索引擎优化 ====================
  ["meta", { name: "msapplication-tooltip", content: "CellStack - 工程师技术笔记" }],
  ["meta", { name: "format-detection", content: "telephone=no" }],

  // ==================== 地理位置和语言 ====================
  ["meta", { name: "geo.region", content: "CN" }],
  ["meta", { name: "geo.country", content: "China" }],
  ["meta", { "http-equiv": "content-language", content: "zh-CN" }],
]
