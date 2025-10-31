/**
 * 掘金API客户端
 * 负责与掘金开放平台API交互
 */

const axios = require('axios');
const Logger = require('../utils/logger');

class JuejinClient {
  constructor(config = {}, logger = new Logger()) {
    this.logger = logger;
    this.token = config.token || process.env.JUEJIN_TOKEN;
    this.baseUrl = 'https://api.juejin.cn/content_api/v1';

    if (!this.token) {
      this.logger.warn('未配置掘金访问令牌，请设置 JUEJIN_TOKEN 环境变量');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    });

    // 添加响应拦截器处理错误
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          this.logger.error(`掘金API请求失败 [${status}]:`, data);
        } else if (error.request) {
          this.logger.error('掘金API请求超时或无响应');
        } else {
          this.logger.error('掘金API请求配置错误:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 发布文章到掘金
   * @param {Object} article - 文章数据
   * @returns {Promise<Object>} 发布结果
   */
  async publishArticle(article) {
    try {
      this.logger.info(`正在发布文章到掘金: ${article.title}`);

      const juejinData = article.juejinData || article;

      const response = await this.client.post('/article/publish', juejinData);

      if (response.data.err_no === 0) {
        const result = {
          success: true,
          articleId: response.data.data.article_id,
          url: response.data.data.url,
          message: response.data.err_tip || '发布成功',
        };

        this.logger.success(`文章发布成功: ${article.title}`);
        this.logger.info(`掘金URL: ${result.url}`);

        return result;
      } else {
        throw new Error(`掘金API返回错误: ${response.data.err_tip || '未知错误'}`);
      }
    } catch (error) {
      this.logger.error(`发布文章失败: ${article.title}`, error);
      throw error;
    }
  }

  /**
   * 更新掘金文章
   * @param {string} articleId - 文章ID
   * @param {Object} article - 文章数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateArticle(articleId, article) {
    try {
      this.logger.info(`正在更新掘金文章: ${article.title}`);

      const juejinData = {
        ...article.juejinData,
        article_id: articleId,
      };

      const response = await this.client.post('/article/edit', juejinData);

      if (response.data.err_no === 0) {
        const result = {
          success: true,
          articleId: response.data.data.article_id,
          url: response.data.data.url,
          message: response.data.err_tip || '更新成功',
        };

        this.logger.success(`文章更新成功: ${article.title}`);
        this.logger.info(`掘金URL: ${result.url}`);

        return result;
      } else {
        throw new Error(`掘金API返回错误: ${response.data.err_tip || '未知错误'}`);
      }
    } catch (error) {
      this.logger.error(`更新文章失败: ${article.title}`, error);
      throw error;
    }
  }

  /**
   * 获取掘金文章详情
   * @param {string} articleId - 文章ID
   * @returns {Promise<Object>} 文章详情
   */
  async getArticle(articleId) {
    try {
      const response = await this.client.get(`/article/detail`, {
        params: { article_id: articleId },
      });

      if (response.data.err_no === 0) {
        return response.data.data;
      } else {
        throw new Error(`获取文章详情失败: ${response.data.err_tip}`);
      }
    } catch (error) {
      this.logger.error(`获取文章详情失败: ${articleId}`, error);
      throw error;
    }
  }

  /**
   * 检查掘金访问令牌是否有效
   * @returns {Promise<boolean>} 令牌是否有效
   */
  async checkToken() {
    try {
      const response = await this.client.get('/user/profile');
      return response.data.err_no === 0;
    } catch (error) {
      this.logger.error('掘金访问令牌验证失败');
      return false;
    }
  }

  /**
   * 获取掘金用户信息
   * @returns {Promise<Object|null>} 用户信息
   */
  async getUserProfile() {
    try {
      const response = await this.client.get('/user/profile');
      if (response.data.err_no === 0) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      this.logger.error('获取用户信息失败', error);
      return null;
    }
  }

  /**
   * 获取掘金分类列表
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    try {
      const response = await this.client.get('/category/list');
      if (response.data.err_no === 0) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      this.logger.error('获取分类列表失败', error);
      return [];
    }
  }

  /**
   * 获取掘金标签列表
   * @returns {Promise<Array>} 标签列表
   */
  async getTags() {
    try {
      const response = await this.client.get('/tag/list');
      if (response.data.err_no === 0) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      this.logger.error('获取标签列表失败', error);
      return [];
    }
  }
}

module.exports = JuejinClient;
