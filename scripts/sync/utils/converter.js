/**
 * 格式转换模块
 * 将Markdown内容转换为各平台所需的格式
 */

const MarkdownIt = require('markdown-it');
const Logger = require('./logger');

class FormatConverter {
  constructor(logger = new Logger()) {
    this.logger = logger;
    this.markdownIt = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
  }

  /**
   * 将Markdown转换为掘金格式
   * @param {Object} article - 文章对象
   * @param {Object} options - 转换选项
   * @returns {Object} 掘金格式的文章数据
   */
  convertToJuejin(article, options = {}) {
    try {
      const {
        siteUrl = 'https://stack.mcell.top',
        imageBaseUrl = 'https://stack-mcell.tos-cn-shanghai.volces.com',
      } = options;

      // 转换Markdown为HTML
      const contentHtml = this.markdownIt.render(article.markdownContent);

      // 处理图片URL
      const contentWithImages = this.convertImageUrls(contentHtml, imageBaseUrl);

      // 提取第一张图片作为封面
      const coverImage = this.extractCoverImage(article.markdownContent, imageBaseUrl);

      // 转换标签格式
      const tagIds = this.mapTagsToJuejinIds(article.tags);

      return {
        title: article.title,
        content: contentWithImages,
        content_markdown: article.markdownContent,
        cover_image: coverImage,
        category_id: this.detectCategory(article.tags, article.title),
        tag_ids: tagIds,
        pickup_time: 0,
        original_url: `${siteUrl}/blog/${article.relativePath.replace(/\.md$/, '')}`,
        need_set_top: false,
      };
    } catch (error) {
      this.logger.error(`转换文章格式失败: ${article.title}`, error);
      throw error;
    }
  }

  /**
   * 转换图片URL
   * @param {string} html - HTML内容
   * @param {string} baseUrl - 图片基础URL
   * @returns {string} 转换后的HTML
   */
  convertImageUrls(html, baseUrl) {
    // 将相对路径图片转换为CDN URL
    return html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      // 如果已经是完整URL，直接返回
      if (url.startsWith('http')) {
        return match;
      }

      // 移除开头的/
      const cleanUrl = url.replace(/^\//, '');
      const fullUrl = `${baseUrl}/${cleanUrl}`;

      return `![${alt}](${fullUrl})`;
    });
  }

  /**
   * 提取封面图片
   * @param {string} markdown - Markdown内容
   * @param {string} baseUrl - 图片基础URL
   * @returns {string|null} 封面图片URL
   */
  extractCoverImage(markdown, baseUrl) {
    const imageMatch = markdown.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      let url = imageMatch[2];
      if (!url.startsWith('http')) {
        url = url.replace(/^\//, '');
        url = `${baseUrl}/${url}`;
      }
      return url;
    }
    return null;
  }

  /**
   * 将标签映射为掘金标签ID
   * @param {Array} tags - 标签列表
   * @returns {Array} 掘金标签ID列表
   */
  mapTagsToJuejinIds(tags) {
    // 掘金常用标签ID映射
    const tagMap = {
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
    };

    const ids = [];
    tags.forEach(tag => {
      if (tagMap[tag]) {
        ids.push(tagMap[tag]);
      }
    });

    // 如果没有匹配的标签，返回前端开发默认分类
    return ids.length > 0 ? ids : ['6809637767543217166'];
  }

  /**
   * 根据标签和标题自动检测分类
   * @param {Array} tags - 标签列表
   * @param {string} title - 文章标题
   * @returns {string} 分类ID
   */
  detectCategory(tags, title) {
    const content = `${title} ${tags.join(' ')}`.toLowerCase();

    if (content.includes('ai') || content.includes('llm') || content.includes('agent') || content.includes('大语言模型')) {
      return '6809637767543217160'; // AI工程
    }
    if (content.includes('docker') || content.includes('kubernetes') || content.includes('devops') || content.includes('linux')) {
      return '6809637767543217185'; // 系统运维
    }
    if (content.includes('go') || content.includes('后端') || content.includes('server')) {
      return '6809637767543217155'; // 后端
    }
    if (content.includes('安全') || content.includes('web') || content.includes('http')) {
      return '6809637767543217193'; // 安全与网络
    }

    return '6809637767543217166'; // 默认前端开发
  }
}

module.exports = FormatConverter;
