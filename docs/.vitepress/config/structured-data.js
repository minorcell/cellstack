/**
 * 结构化数据配置
 */

module.exports = {
  // 结构化数据 - Website Schema
  website: {
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
  },
};
