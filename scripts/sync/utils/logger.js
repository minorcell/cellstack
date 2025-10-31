/**
 * 日志工具模块
 * 提供不同级别的日志输出功能
 */

class Logger {
  constructor(debug = false) {
    this.debug = debug;
  }

  /**
   * 输出信息日志
   * @param {string} message - 日志消息
   */
  info(message) {
    console.log(`ℹ️  [INFO] ${message}`);
  }

  /**
   * 输出成功日志
   * @param {string} message - 日志消息
   */
  success(message) {
    console.log(`✅ [SUCCESS] ${message}`);
  }

  /**
   * 输出警告日志
   * @param {string} message - 日志消息
   */
  warn(message) {
    console.log(`⚠️  [WARN] ${message}`);
  }

  /**
   * 输出错误日志
   * @param {string} message - 日志消息
   * @param {Error} [error] - 错误对象
   */
  error(message, error = null) {
    console.error(`❌ [ERROR] ${message}`);
    if (error && this.debug) {
      console.error(error.stack);
    }
  }

  /**
   * 输出调试日志
   * @param {string} message - 日志消息
   */
  debugLog(message) {
    if (this.debug) {
      console.log(`🐛 [DEBUG] ${message}`);
    }
  }
}

module.exports = Logger;
