import { RssPlugin } from "vitepress-plugin-rss"
import { themeConfig } from "./config/theme.config.js"
import { sidebar } from "./config/sidebar.config.js"
import { head } from "./config/head.config.js"
import { rssConfig } from "./config/rss.config.js"

const config = {
  base: "/",
  title: "CellStack - 工程师技术笔记",
  titleTemplate: ":title | CellStack",
  description:
    "计算机科学的工程实践和个人思考。涵盖前端开发、后端架构、DevOps运维、AI工程等技术领域的深度文章和实战经验分享。",

  themeConfig: {
    ...themeConfig,
    sidebar,
  },

  head,

  sitemap: {
    hostname: "https://stack.mcell.top",
    transformItems: (items) => {
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

  vite: {
    plugins: [RssPlugin(rssConfig)]
  }
}

export default config
