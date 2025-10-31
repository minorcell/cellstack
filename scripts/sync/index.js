/**
 * 多平台同步发布主脚本
 * 自动将博客文章同步到各大技术平台
 */

const path = require('path');
const fs = require('fs').promises;

// 导入模块
const Logger = require('./utils/logger');
const ArticleParser = require('./utils/parser');
const FormatConverter = require('./utils/converter');
const StateManager = require('./utils/state');
const JuejinClient = require('./platforms/juejin');
const config = require('./config/sync.config');

class SyncManager {
  constructor(options = {}) {
    this.logger = new Logger(options.debug || false);
    this.parser = new ArticleParser(
      path.resolve(process.cwd(), config.global.blogDir),
      this.logger
    );
    this.converter = new FormatConverter(this.logger);
    this.stateManager = new StateManager(config.global.stateFile, this.logger);

    // 初始化平台客户端
    this.platforms = {};
    if (config.juejin.enabled) {
      this.platforms.juejin = new JuejinClient(config.juejin, this.logger);
    }

    this.options = {
      platform: options.platform || 'all',
      force: options.force || false,
      dryRun: options.dryRun || false,
      debug: options.debug || false,
    };

    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    };
  }

  /**
   * 执行同步
   */
  async run() {
    try {
      this.logger.info('🚀 开始同步博客文章到各平台');
      this.logger.info(`模式: ${this.options.dryRun ? '预览' : '正式'} | 平台: ${this.options.platform}`);

      // 加载状态文件
      await this.stateManager.load();

      // 检查平台令牌
      await this.checkPlatformTokens();

      // 扫描文章
      const articles = await this.parser.scanArticles();
      this.stats.total = articles.length;

      this.logger.info(`发现 ${articles.length} 篇文章`);

      // 过滤需要同步的文章
      const targetArticles = await this.filterArticles(articles);

      if (targetArticles.length === 0) {
        this.logger.info('✨ 没有需要同步的文章');
        this.stateManager.updateStats(this.stats.total, this.stats.success, this.stats.failed);
        return;
      }

      this.logger.info(`准备同步 ${targetArticles.length} 篇文章`);

      // 同步文章
      await this.syncArticles(targetArticles);

      // 更新统计信息
      this.stateManager.updateStats(this.stats.total, this.stats.success, this.stats.failed);

      // 打印最终报告
      this.printReport();

    } catch (error) {
      this.logger.error('同步过程中发生错误', error);
      process.exit(1);
    }
  }

  /**
   * 检查平台访问令牌
   */
  async checkPlatformTokens() {
    // 预览模式下跳过令牌检查
    if (this.options.dryRun) {
      this.logger.info('[预览模式] 跳过令牌检查');
      return;
    }

    if (this.options.platform === 'all' || this.options.platform === 'juejin') {
      if (config.juejin.enabled) {
        const isValid = await this.platforms.juejin.checkToken();
        if (!isValid) {
          this.logger.error('掘金访问令牌无效，请检查 JUEJIN_TOKEN');
          process.exit(1);
        }
        this.logger.success('掘金访问令牌验证通过');
      }
    }
  }

  /**
   * 过滤需要同步的文章
   * @param {Array} articles - 文章列表
   * @returns {Array} 目标文章列表
   */
  async filterArticles(articles) {
    // 跳过不需要同步的文件
    const filtered = articles.filter(article => {
      return !config.skipPatterns.some(pattern => pattern.test(article.filename));
    });

    // 根据模式过滤
    if (config.syncMode.mode === 'incremental' && !this.options.force) {
      const targetPlatform = this.options.platform === 'all' ? 'juejin' : this.options.platform;
      return this.parser.getUnsyncedArticles(targetPlatform, filtered);
    }

    return filtered;
  }

  /**
   * 同步文章列表
   * @param {Array} articles - 文章列表
   */
  async syncArticles(articles) {
    for (const article of articles) {
      try {
        this.logger.info(`\n处理文章: ${article.title}`);

        // 检查是否已在目标平台发布
        if (!this.options.force && this.isAlreadyPublished(article)) {
          this.logger.info('文章已发布，跳过');
          this.stats.skipped++;
          continue;
        }

        // 执行同步
        const success = await this.syncArticle(article);

        if (success) {
          this.stats.success++;
        } else {
          this.stats.failed++;
        }
      } catch (error) {
        this.logger.error(`同步文章失败: ${article.title}`, error);
        this.stats.failed++;
      }
    }
  }

  /**
   * 同步单篇文章
   * @param {Object} article - 文章对象
   * @returns {boolean} 是否成功
   */
  async syncArticle(article) {
    const platform = this.options.platform;

    if (platform === 'all' || platform === 'juejin') {
      return this.syncToJuejin(article);
    }

    return false;
  }

  /**
   * 同步文章到掘金
   * @param {Object} article - 文章对象
   * @returns {boolean} 是否成功
   */
  async syncToJuejin(article) {
    try {
      if (this.options.dryRun) {
        this.logger.info(`[预览] 将在掘金发布: ${article.title}`);
        return true;
      }

      // 转换格式
      const juejinData = this.converter.convertToJuejin(article, {
        siteUrl: config.global.siteUrl,
        imageBaseUrl: config.global.imageBaseUrl,
      });

      const articleWithJuejinData = {
        ...article,
        juejinData,
      };

      // 检查是否已存在（通过状态文件）
      const existingInfo = this.stateManager.getPublishInfo(article.path, 'juejin');

      let result;
      if (existingInfo?.articleId) {
        // 更新已存在的文章
        result = await this.platforms.juejin.updateArticle(existingInfo.articleId, articleWithJuejinData);
      } else {
        // 发布新文章
        result = await this.platforms.juejin.publishArticle(articleWithJuejinData);
      }

      // 标记为已发布
      await this.stateManager.markAsPublished(article.path, 'juejin', {
        url: result.url,
        articleId: result.articleId,
      });

      return true;
    } catch (error) {
      await this.stateManager.markAsFailed(article.path, 'juejin', error.message);
      return false;
    }
  }

  /**
   * 检查文章是否已发布
   * @param {Object} article - 文章对象
   * @returns {boolean} 是否已发布
   */
  isAlreadyPublished(article) {
    const platform = this.options.platform;
    if (platform === 'all' || platform === 'juejin') {
      return this.stateManager.isPublished(article.path, 'juejin');
    }
    return false;
  }

  /**
   * 打印同步报告
   */
  printReport() {
    this.logger.info('\n' + '='.repeat(50));
    this.logger.info('📊 同步报告');
    this.logger.info('='.repeat(50));
    this.logger.info(`总文章数: ${this.stats.total}`);
    this.logger.info(`成功同步: ${this.stats.success}`);
    this.logger.info(`同步失败: ${this.stats.failed}`);
    this.logger.info(`跳过文章: ${this.stats.skipped}`);
    this.logger.info('='.repeat(50));

    // 显示掘金发布概览
    const juejinOverview = this.stateManager.getPlatformOverview('juejin');
    this.logger.info('\n掘金平台发布概览:');
    this.logger.info(`  已发布: ${juejinOverview.published}`);
    this.logger.info(`  失败: ${juejinOverview.failed}`);
    this.logger.info(`  待发布: ${juejinOverview.total - juejinOverview.published - juejinOverview.failed}`);
  }
}

// CLI入口点
if (require.main === module) {
  const args = process.argv.slice(2);
  const platform = args[0] || 'juejin';
  const options = {
    platform,
    debug: args.includes('--debug'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
  };

  const syncManager = new SyncManager(options);
  syncManager.run();
}

module.exports = SyncManager;
