export default {
  base: "/",
  title: "CellStack",
  description:
    "一个工程师的技术笔记，涵盖前端、后端、DevOps 与 AI 工程实践，从零到落地。",
  head: [
    ["link", { rel: "icon", href: "/hero-illustration.svg" }],
    [
      "meta",
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ],
    ["meta", { name: "theme-color", content: "#8b7355" }],
  ],
  appearance: "dark",
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "CellStack",
    nav: [
      { text: "语言基础", link: "/language-basics/" },
      { text: "工程实践", link: "/engineering-practice/" },
      { text: "博客", link: "/blog/" },
    ],
    sidebar: {
      "/language-basics/": [
        {
          text: "语言基础",
          items: [
            { text: "介绍", link: "/language-basics/" },
          ],
        },
      ],
      "/engineering-practice/": [
        {
          text: "工程实践",
          items: [
            { text: "介绍", link: "/engineering-practice/" },
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
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/minorcell/cellstack" },
    ],
    footer: {
      message: "持续探索，用爱发电。",
      copyright: "Copyright © 2025 CellStack",
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
        placeholder: "搜索文档...",
        translations: {
          button: {
            buttonText: "搜索",
            buttonAriaLabel: "搜索",
          },
          modal: {
            searchBox: {
              resetButtonTitle: "清除查询条件",
              resetButtonAriaLabel: "清除查询条件",
              cancelButtonText: "取消",
              cancelButtonAriaLabel: "取消",
            },
            startScreen: {
              recentSearchesTitle: "搜索历史",
              noRecentSearchesText: "没有搜索历史",
              saveRecentSearchButtonTitle: "保存至搜索历史",
              removeRecentSearchButtonTitle: "从搜索历史中移除",
              favoriteSearchesTitle: "收藏",
              removeFavoriteSearchButtonTitle: "从收藏中移除",
            },
            errorScreen: {
              titleText: "无法获取结果",
              helpText: "你可能需要检查你的网络连接",
            },
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
            noResultsScreen: {
              noResultsText: "无法找到相关结果",
              suggestedQueryText: "你可以尝试查询",
              reportMissingResultsText: "你认为该查询应该有结果？",
              reportMissingResultsLinkText: "点击反馈",
            },
          },
        },
      },
    },
  },
};
