/**
 * 文章解析模块
 * 负责解析Markdown文件，提取frontmatter和内容
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const Logger = require('./logger');

class ArticleParser {
  constructor(blogDir, logger = new Logger()) {
    this.blogDir = blogDir;
    this.logger = logger;
  }

  /**
   * 解析单个Markdown文件
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} 解析后的文章对象
   */
  async parseFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: markdownContent } = matter(content);

      // 提取文件名作为URL slug
      const filename = path.basename(filePath, '.md');
      const slug = filename.replace(/^\d+_/, ''); // 移除前缀数字

      return {
        path: filePath,
        slug,
        filename,
        title: frontmatter.title || slug,
        description: frontmatter.description || '',
        author: frontmatter.author || 'mcell',
        tags: frontmatter.tags || [],
        keywords: frontmatter.keywords || [],
        date: frontmatter.date || this.extractDateFromFilename(filename),
        frontmatter,
        markdownContent,
        relativePath: this.getRelativePath(filePath),
      };
    } catch (error) {
      this.logger.error(`解析文件失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 从文件名提取日期
   * @param {string} filename - 文件名
   * @returns {string} 日期字符串
   */
  extractDateFromFilename(filename) {
    const match = filename.match(/^(\d{4})/);
    if (match) {
      return match[1];
    }
    return new Date().getFullYear().toString();
  }

  /**
   * 获取文件相对路径
   * @param {string} filePath - 绝对路径
   * @returns {string} 相对路径
   */
  getRelativePath(filePath) {
    return path.relative(this.blogDir, filePath);
  }

  /**
   * 扫描博客目录，获取所有文章
   * @param {string} [subDir] - 子目录，如 '2025'
   * @returns {Promise<Array>} 文章列表
   */
  async scanArticles(subDir = null) {
    const targetDir = subDir ? path.join(this.blogDir, subDir) : this.blogDir;
    const articles = [];

    try {
      const entries = await fs.readdir(targetDir, { withFileTypes: true });

      for (const entry of entries) {
        // 跳过非目录和非md文件
        if (!entry.isDirectory() && !entry.name.endsWith('.md')) {
          continue;
        }

        // 处理目录
        if (entry.isDirectory()) {
          if (/^\d{4}$/.test(entry.name)) {
            // 是年份目录，递归扫描
            const subArticles = await this.scanArticles(entry.name);
            articles.push(...subArticles);
          }
          continue;
        }

        // 跳过index文件
        if (entry.name === 'index.md') {
          continue;
        }

        // 解析文章文件
        const filePath = path.join(targetDir, entry.name);
        const article = await this.parseFile(filePath);
        articles.push(article);
      }

      this.logger.debugLog(`扫描到 ${articles.length} 篇文章`);
      return articles;
    } catch (error) {
      this.logger.error(`扫描目录失败: ${targetDir}`, error);
      throw error;
    }
  }

  /**
   * 获取未同步的文章
   * @param {string} platform - 平台名称
   * @param {Array} articles - 文章列表
   * @returns {Array} 未同步文章列表
   */
  getUnsyncedArticles(platform, articles) {
    return articles.filter(article => {
      const publishedPlatforms = article.frontmatter.published_platforms || {};
      return !publishedPlatforms[platform];
    });
  }
}

module.exports = ArticleParser;
