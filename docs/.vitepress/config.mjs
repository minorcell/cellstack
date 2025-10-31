import { withMermaid } from "vitepress-plugin-mermaid"
import { RssPlugin } from "vitepress-plugin-rss"

// 导入配置模块
import themeConfig from "./config/theme.js"
import navConfig from "./config/navigation.js"
import sidebarConfig from "./config/sidebar.js"
import searchConfig from "./config/search.js"
import seoConfig from "./config/seo.js"
import structuredData from "./config/structured-data.js"

const defaultTheme = {
  ...themeConfig,
  ...navConfig,
  ...searchConfig,

  themeConfig: {
    ...themeConfig.themeConfig,
    ...navConfig.nav,
    ...searchConfig.search,
    ...sidebarConfig.sidebar,
  },

  head: [
    ...seoConfig.head,

    // 结构化数据 - Website Schema
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify(structuredData.website),
    ],
  ],

  // 站点地图和SEO配置
  sitemap: {
    hostname: "https://stack.mcell.top",
    transformItems: (items) => {
      // 为sitemap添加更多SEO信息
      return items.map((item) => ({
        ...item,
        changefreq: item.url.includes('/blog/') ? 'weekly' : 'monthly',
        priority: item.url === 'https://stack.mcell.top/' ? 1.0 :
          item.url.includes('/blog/') ? 0.8 : 0.6,
      }))
    }
  },

  appearance: false,
  lastUpdated: true,
  cleanUrls: true,

  // 自定义页面元数据
  transformPageData(pageData) {
    const canonicalUrl = `https://stack.mcell.top${pageData.relativePath}`
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "")

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:url", content: canonicalUrl }],
    )
  },

  // Markdown 配置优化
  markdown: {
    lineNumbers: false,
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
  }
}

// RSS 插件配置（使用 vitepress-plugin-rss 生成 feed.xml）
const RSS = {
  title: "CellStack - 工程师技术笔记",
  description:
    "计算机科学的工程实践和个人思考。涵盖前端开发、后端架构、DevOps运维、AI工程等技术领域的深度文章和实战经验分享。",
  baseUrl: "https://stack.mcell.top",
  url: "https://stack.mcell.top/feed.xml",
  filename: "feed.xml",
  copyright: `© ${new Date().getFullYear()} mCell`,
  language: "zh-cn",
  author: {
    name: "mCell",
    link: "https://stack.mcell.top",
  },
  ignoreHome: true,
  ignorePublish: false,
  // 仅收录博客目录下的文章，排除 index 页面
  filter: (post) => post.url && post.url.startsWith("/blog/") && !post.url.includes("index"),
}

export default withMermaid({
  ...defaultTheme,
  // 集成 RSS 生成插件
  vite: {
    plugins: [RssPlugin(RSS)]
  }
})
