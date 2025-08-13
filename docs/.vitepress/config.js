export default {
  base: '/cellstack/',
  title: 'CellStack',
  description: '一个工程师的技术笔记，涵盖前端、后端、DevOps 与 AI 工程实践，从零到落地。',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '语言基础', link: '/language-basics/' },
      { text: '工程实践', link: '/engineering-practice/' },
      { text: '博客', link: '/blog/' }
    ],
    sidebar: {
      '/language-basics/': [
        {
          text: '语言基础',
          items: [
            { text: '介绍', link: '/language-basics/' }
          ]
        }
      ],
      '/engineering-practice/': [
        {
          text: '工程实践',
          items: [
            { text: '介绍', link: '/engineering-practice/' }
          ]
        }
      ],
      '/blog/': [
        {
          text: '博客',
          items: [
            { text: '所有文章', link: '/blog/' },
            { text: '第一篇博客', link: '/blog/first-post' }
          ]
        }
      ]
    }
  }
}