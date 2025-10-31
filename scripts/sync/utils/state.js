/**
 * 状态管理模块
 * 管理文章的同步状态，记录已发布的平台信息
 */

const fs = require('fs').promises;
const path = require('path');
const Logger = require('./logger');

class StateManager {
  constructor(stateFile = '.sync-state.json', logger = new Logger()) {
    this.stateFile = stateFile;
    this.logger = logger;
    this.state = {
      platform: {},
      lastSync: null,
      stats: {
        total: 0,
        synced: 0,
        failed: 0,
      },
    };
  }

  /**
   * 加载状态文件
   */
  async load() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');
      this.state = JSON.parse(data);
      this.logger.debugLog(`已加载状态文件: ${this.stateFile}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.debugLog('状态文件不存在，将创建新的状态文件');
        await this.save();
      } else {
        this.logger.error('加载状态文件失败', error);
        throw error;
      }
    }
  }

  /**
   * 保存状态文件
   */
  async save() {
    try {
      await fs.writeFile(this.stateFile, JSON.stringify(this.state, null, 2), 'utf-8');
      this.logger.debugLog(`已保存状态文件: ${this.stateFile}`);
    } catch (error) {
      this.logger.error('保存状态文件失败', error);
      throw error;
    }
  }

  /**
   * 检查文章是否已在指定平台发布
   * @param {string} articlePath - 文章路径
   * @param {string} platform - 平台名称
   * @returns {boolean} 是否已发布
   */
  isPublished(articlePath, platform) {
    return this.state.platform[articlePath]?.[platform]?.published || false;
  }

  /**
   * 获取文章的发布信息
   * @param {string} articlePath - 文章路径
   * @param {string} platform - 平台名称
   * @returns {Object|null} 发布信息
   */
  getPublishInfo(articlePath, platform) {
    return this.state.platform[articlePath]?.[platform] || null;
  }

  /**
   * 标记文章为已发布
   * @param {string} articlePath - 文章路径
   * @param {string} platform - 平台名称
   * @param {Object} info - 发布信息（包含URL、发布时间等）
   */
  async markAsPublished(articlePath, platform, info = {}) {
    if (!this.state.platform[articlePath]) {
      this.state.platform[articlePath] = {};
    }

    this.state.platform[articlePath][platform] = {
      published: true,
      publishTime: new Date().toISOString(),
      url: info.url || null,
      articleId: info.articleId || null,
      ...info,
    };

    this.state.lastSync = new Date().toISOString();
    await this.save();
    this.logger.success(`已标记文章在 ${platform} 发布: ${articlePath}`);
  }

  /**
   * 标记文章发布失败
   * @param {string} articlePath - 文章路径
   * @param {string} platform - 平台名称
   * @param {string} error - 错误信息
   */
  async markAsFailed(articlePath, platform, error) {
    if (!this.state.platform[articlePath]) {
      this.state.platform[articlePath] = {};
    }

    this.state.platform[articlePath][platform] = {
      published: false,
      failed: true,
      error: error,
      lastAttempt: new Date().toISOString(),
    };

    await this.save();
    this.logger.warn(`文章发布失败 [${platform}]: ${articlePath} - ${error}`);
  }

  /**
   * 更新同步统计信息
   * @param {number} total - 总文章数
   * @param {number} synced - 已同步数
   * @param {number} failed - 失败数
   */
  updateStats(total, synced, failed) {
    this.state.stats = { total, synced, failed };
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return this.state.stats;
  }

  /**
   * 获取平台发布概览
   * @param {string} platform - 平台名称
   * @returns {Object} 发布概览
   */
  getPlatformOverview(platform) {
    const overview = {
      published: 0,
      failed: 0,
      pending: 0,
      total: 0,
    };

    Object.values(this.state.platform).forEach(articlePlatforms => {
      const platformInfo = articlePlatforms[platform];
      if (platformInfo) {
        overview.total++;
        if (platformInfo.published) {
          overview.published++;
        } else if (platformInfo.failed) {
          overview.failed++;
        } else {
          overview.pending++;
        }
      }
    });

    return overview;
  }
}

module.exports = StateManager;
