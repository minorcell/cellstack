/**
 * 搜索配置
 */

module.exports = {
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
};
