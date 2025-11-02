/**
 * RSS 订阅配置
 * 使用 vitepress-plugin-rss 插件生成 feed.xml
 */
export const rssConfig = {
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
  // 仅收录 topics 目录下的文章，排除 index 页面
  filter: (post) => post.url && post.url.startsWith("/topics/") && !post.url.includes("index"),
}
