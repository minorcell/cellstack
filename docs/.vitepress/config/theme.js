/**
 * 主题配置
 */

module.exports = {
  base: "/",
  title: "CellStack - 工程师技术笔记",
  titleTemplate: ":title | CellStack",
  description:
    "计算机科学的工程实践和个人思考。涵盖前端开发、后端架构、DevOps运维、AI工程等技术领域的深度文章和实战经验分享。",

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "CellStack",
    // 供 vitepress-plugin-rss 插件注入 RSS 链接
    socialLinks: [],

    footer: {
      message: `累计访问 <span id="busuanzi_value_site_pv" ></span> 次`,
      copyright: `© ${new Date().getFullYear()} Created by mcell 豫ICP备2025129196号-1`,
    },

    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
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
};
