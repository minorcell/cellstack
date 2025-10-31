/**
 * 同步配置
 * 存储各个平台的配置信息和映射规则
 */

module.exports = {
  // 掘金平台配置
  juejin: {
    enabled: true,
    apiUrl: 'https://api.juejin.cn/content_api/v1',
    defaultCategory: '6809637767543217166', // 前端开发
    categories: {
      'AI工程': '6809637767543217160',
      '系统运维': '6809637767543217185',
      '后端': '6809637767543217155',
      '安全与网络': '6809637767543217193',
      '前端开发': '6809637767543217166',
    },
    tagMapping: {
      '前端开发': '6809637767543217166',
      'JavaScript': '6809637767543217166',
      'Vue': '6809637767543217166',
      'React': '6809637767543217166',
      'TypeScript': '6809637767543217166',
      '后端': '6809637767543217155',
      'Go': '6809637767543217155',
      'Node.js': '6809637767543217155',
      'DevOps': '6809637767543217185',
      'Docker': '6809637767543217185',
      'Kubernetes': '6809637767543217185',
      'AI工程': '6809637767543217160',
      '大语言模型': '6809637767543217160',
      'LLM': '6809637767543217160',
      'AI Agent': '6809637767543217160',
      '系统运维': '6809637767543217185',
      'Linux': '6809637767543217185',
      '网络安全': '6809637767543217193',
      '算法': '6809637767543217166',
      '数据结构': '6809637767543217166',
    },
  },

  // 全局配置
  global: {
    // 站点配置
    siteUrl: 'https://stack.mcell.top',
    imageBaseUrl: 'https://stack-mcell.tos-cn-shanghai.volces.com',

    // 博客目录
    blogDir: process.env.BLOG_DIR || 'docs/blog',

    // 状态文件
    stateFile: '.sync-state.json',

    // 重试配置
    retry: {
      maxAttempts: 3,
      delay: 2000, // 2秒
    },

    // 并发控制
    concurrency: {
      maxConcurrent: 3, // 最大并发数
    },
  },

  // 平台优先级（数字越小优先级越高）
  platformPriority: {
    juejin: 1,
    csdn: 2,
    oschina: 3,
  },

  // 跳过同步的文件模式
  skipPatterns: [
    /^index\.md$/,
    /^\.DS_Store$/,
  ],

  // 同步模式
  syncMode: {
    // 'incremental' - 仅同步未同步的文章
    // 'force' - 强制重新同步所有文章
    mode: 'incremental',
  },
};
