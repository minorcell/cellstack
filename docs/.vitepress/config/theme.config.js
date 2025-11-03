/**
 * 主题配置
 * 导航栏、搜索、UI文本等主题相关配置
 */
export const themeConfig = {
  logo: "/logo.svg",
  siteTitle: "CellStack",

  // 供 vitepress-plugin-rss 插件注入 RSS 链接
  socialLinks: [],

  // 导航栏
  nav: [
    {
      text: "我",
      link: "/me/",
      activeMatch: "/me/",
    },
    {
      text: "专题",
      activeMatch: "/topics/",
      items: [
        { text: "AI", link: "/topics/ai/" },
        { text: "网络", link: "/topics/network/" },
        { text: "语言", link: "/topics/language/" },
        { text: "运维", link: "/topics/devops/" },
        { text: "性能优化", link: "/topics/performance/" },
      ],
    },
    {
      text: "收录",
      link: "/transpond/",
      activeMatch: "/transpond/",
    },
  ],

  // 页脚
  footer: {
    message: `累计访问 <span id="busuanzi_value_site_pv" ></span> 次`,
    copyright: `© ${new Date().getFullYear()} Created by mcell 豫ICP备2025129196号-1`,
  },

  // 最后更新时间
  lastUpdated: {
    text: "最后更新",
    formatOptions: {
      dateStyle: "short",
      timeStyle: "medium",
    },
  },

  // 本地搜索
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

  // 其他UI文本
  returnToTopLabel: "返回顶部",
  sidebarMenuLabel: "菜单",
  darkModeSwitchLabel: "主题",
  lightModeSwitchTitle: "切换到浅色模式",
  darkModeSwitchTitle: "切换到深色模式",
}
