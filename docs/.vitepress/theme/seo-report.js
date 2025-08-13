// SEO 性能监控和报告工具
// 用于分析网站SEO表现并生成优化建议

export class SEOReporter {
  constructor() {
    this.siteUrl = "https://stack.mcell.top";
    this.reportData = {
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
      performance: {},
      seo: {},
      accessibility: {},
      suggestions: [],
    };
  }

  // 生成完整的SEO报告
  async generateReport() {
    console.log("🔍 开始生成SEO报告...");

    await this.analyzePage();
    await this.checkPerformance();
    await this.auditSEO();
    await this.checkAccessibility();
    await this.generateSuggestions();

    return this.reportData;
  }

  // 页面基础分析
  async analyzePage() {
    const title = document.title;
    const description = document.querySelector(
      'meta[name="description"]',
    )?.content;
    const h1Count = document.querySelectorAll("h1").length;
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const images = document.querySelectorAll("img");
    const links = document.querySelectorAll("a");

    this.reportData.seo.basic = {
      title: {
        content: title,
        length: title.length,
        isOptimal: title.length >= 30 && title.length <= 60,
      },
      description: {
        content: description,
        length: description?.length || 0,
        isOptimal:
          description && description.length >= 120 && description.length <= 160,
      },
      headings: {
        total: headings.length,
        h1Count: h1Count,
        structure: this.analyzeHeadingStructure(headings),
        isValid: h1Count === 1,
      },
      images: {
        total: images.length,
        withAlt: Array.from(images).filter((img) => img.alt).length,
        withoutAlt: Array.from(images).filter((img) => !img.alt).length,
        optimizationRate: (
          (Array.from(images).filter((img) => img.alt).length / images.length) *
          100
        ).toFixed(1),
      },
      links: {
        total: links.length,
        internal: Array.from(links).filter(
          (link) =>
            link.href.includes(this.siteUrl) || link.href.startsWith("/"),
        ).length,
        external: Array.from(links).filter(
          (link) =>
            link.href.startsWith("http") && !link.href.includes(this.siteUrl),
        ).length,
      },
    };
  }

  // 性能分析
  async checkPerformance() {
    if (!("performance" in window)) return;

    const navigation = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");

    if (navigation) {
      this.reportData.performance = {
        dns: Math.round(
          navigation.domainLookupEnd - navigation.domainLookupStart,
        ),
        tcp: Math.round(navigation.connectEnd - navigation.connectStart),
        ttfb: Math.round(navigation.responseStart - navigation.requestStart),
        domLoaded: Math.round(
          navigation.domContentLoadedEventEnd - navigation.navigationStart,
        ),
        pageLoad: Math.round(
          navigation.loadEventEnd - navigation.navigationStart,
        ),
        fcp:
          paint.find((p) => p.name === "first-contentful-paint")?.startTime ||
          0,
        lcp: await this.getLCP(),
        cls: await this.getCLS(),
        fid: await this.getFID(),
      };
    }

    // 资源分析
    const resources = performance.getEntriesByType("resource");
    this.reportData.performance.resources = {
      total: resources.length,
      images: resources.filter((r) =>
        r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i),
      ).length,
      scripts: resources.filter((r) => r.name.match(/\.js$/i)).length,
      styles: resources.filter((r) => r.name.match(/\.css$/i)).length,
      fonts: resources.filter((r) => r.name.match(/\.(woff|woff2|ttf|otf)$/i))
        .length,
    };
  }

  // SEO审计
  async auditSEO() {
    const issues = [];
    const successes = [];

    // 检查必要meta标签
    const requiredMetas = [
      { name: "description", required: true },
      { name: "viewport", required: true },
      { name: "author", required: false },
      { property: "og:title", required: true },
      { property: "og:description", required: true },
      { property: "og:url", required: true },
      { property: "og:type", required: true },
      { name: "twitter:card", required: false },
    ];

    requiredMetas.forEach((meta) => {
      const selector = meta.name
        ? `meta[name="${meta.name}"]`
        : `meta[property="${meta.property}"]`;
      const element = document.querySelector(selector);

      if (!element && meta.required) {
        issues.push(`缺少必要的${meta.name || meta.property}标签`);
      } else if (element) {
        successes.push(`✓ ${meta.name || meta.property}标签配置正确`);
      }
    });

    // 检查结构化数据
    const structuredData = document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    if (structuredData.length === 0) {
      issues.push("缺少结构化数据(JSON-LD)");
    } else {
      successes.push(`✓ 发现${structuredData.length}个结构化数据块`);
    }

    // 检查canonical链接
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      issues.push("缺少canonical链接");
    } else {
      successes.push("✓ canonical链接配置正确");
    }

    // 检查robots meta
    const robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      issues.push("建议添加robots meta标签");
    } else {
      successes.push("✓ robots指令配置正确");
    }

    this.reportData.seo.audit = {
      issues,
      successes,
      score: (
        (successes.length / (successes.length + issues.length)) *
        100
      ).toFixed(1),
    };
  }

  // 可访问性检查
  async checkAccessibility() {
    const issues = [];
    const successes = [];

    // 检查图片alt属性
    const images = document.querySelectorAll("img");
    const imagesWithoutAlt = Array.from(images).filter((img) => !img.alt);

    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length}张图片缺少alt属性`);
    } else if (images.length > 0) {
      successes.push("✓ 所有图片都有alt属性");
    }

    // 检查标题结构
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const h1s = document.querySelectorAll("h1");

    if (h1s.length !== 1) {
      issues.push(`页面应有且仅有一个H1标签，当前有${h1s.length}个`);
    } else {
      successes.push("✓ H1标签结构正确");
    }

    // 检查链接文本
    const links = document.querySelectorAll("a");
    const emptyLinks = Array.from(links).filter(
      (link) => !link.textContent.trim() && !link.getAttribute("aria-label"),
    );

    if (emptyLinks.length > 0) {
      issues.push(`${emptyLinks.length}个链接缺少描述文本`);
    } else {
      successes.push("✓ 所有链接都有描述文本");
    }

    // 检查焦点管理
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    const withoutFocusStyle = Array.from(focusableElements).filter((el) => {
      const styles = window.getComputedStyle(el, ":focus-visible");
      return !styles.outline || styles.outline === "none";
    });

    if (withoutFocusStyle.length > 0) {
      issues.push("部分交互元素缺少焦点样式");
    } else {
      successes.push("✓ 焦点管理配置正确");
    }

    this.reportData.accessibility = {
      issues,
      successes,
      score: (
        (successes.length / (successes.length + issues.length)) *
        100
      ).toFixed(1),
    };
  }

  // 核心Web指标
  async getLCP() {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
        observer.disconnect();
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });

      // 超时保护
      setTimeout(() => resolve(0), 5000);
    });
  }

  async getCLS() {
    return new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      observer.observe({ entryTypes: ["layout-shift"] });

      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 3000);
    });
  }

  async getFID() {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0];
        resolve(firstInput.processingStart - firstInput.startTime);
        observer.disconnect();
      });
      observer.observe({ entryTypes: ["first-input"] });

      // 超时保护
      setTimeout(() => resolve(0), 10000);
    });
  }

  // 分析标题结构
  analyzeHeadingStructure(headings) {
    const structure = [];
    let currentLevel = 0;

    Array.from(headings).forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent.trim();

      structure.push({
        level,
        text: text.substring(0, 50),
        isSkipped: level > currentLevel + 1,
        id: heading.id || "no-id",
      });

      currentLevel = level;
    });

    return structure;
  }

  // 生成优化建议
  async generateSuggestions() {
    const suggestions = [];

    // 标题优化建议
    if (!this.reportData.seo.basic.title.isOptimal) {
      if (this.reportData.seo.basic.title.length < 30) {
        suggestions.push({
          type: "title",
          level: "high",
          message: "页面标题过短，建议扩展到30-60字符",
          action: "在标题中添加更多描述性关键词",
        });
      } else if (this.reportData.seo.basic.title.length > 60) {
        suggestions.push({
          type: "title",
          level: "medium",
          message: "页面标题过长，可能在搜索结果中被截断",
          action: "精简标题到60字符以内",
        });
      }
    }

    // 描述优化建议
    if (!this.reportData.seo.basic.description.isOptimal) {
      if (this.reportData.seo.basic.description.length < 120) {
        suggestions.push({
          type: "description",
          level: "high",
          message: "页面描述过短，建议扩展到120-160字符",
          action: "添加更多页面内容的详细描述",
        });
      } else if (this.reportData.seo.basic.description.length > 160) {
        suggestions.push({
          type: "description",
          level: "medium",
          message: "页面描述过长，可能在搜索结果中被截断",
          action: "精简描述到160字符以内",
        });
      }
    }

    // 图片优化建议
    if (this.reportData.seo.basic.images.withoutAlt > 0) {
      suggestions.push({
        type: "images",
        level: "high",
        message: `${this.reportData.seo.basic.images.withoutAlt}张图片缺少alt属性`,
        action: "为所有图片添加描述性的alt文本",
      });
    }

    // 性能优化建议
    if (this.reportData.performance.pageLoad > 3000) {
      suggestions.push({
        type: "performance",
        level: "high",
        message: "页面加载时间过长",
        action: "优化图片大小、启用压缩、使用CDN",
      });
    }

    if (this.reportData.performance.lcp > 2500) {
      suggestions.push({
        type: "performance",
        level: "medium",
        message: "LCP (最大内容绘制) 超过2.5秒",
        action: "优化关键资源加载顺序",
      });
    }

    if (this.reportData.performance.cls > 0.1) {
      suggestions.push({
        type: "performance",
        level: "medium",
        message: "CLS (累积布局偏移) 过高",
        action: "为图片和媒体元素添加明确的尺寸",
      });
    }

    this.reportData.suggestions = suggestions;
  }

  // 输出可读的报告
  printReport() {
    const report = this.reportData;

    console.group("📊 CellStack SEO 性能报告");
    console.log(
      `🕒 生成时间: ${new Date(report.timestamp).toLocaleString("zh-CN")}`,
    );
    console.log(`🔗 页面URL: ${report.url}`);

    console.group("📄 页面基础信息");
    console.log(
      `标题: "${report.seo.basic.title.content}" (${report.seo.basic.title.length}字符)`,
    );
    console.log(
      `描述: "${report.seo.basic.description.content}" (${report.seo.basic.description.length}字符)`,
    );
    console.log(
      `H1标签: ${report.seo.basic.headings.h1Count}个 ${report.seo.basic.headings.isValid ? "✅" : "❌"}`,
    );
    console.log(
      `图片优化: ${report.seo.basic.images.optimizationRate}% (${report.seo.basic.images.withAlt}/${report.seo.basic.images.total})`,
    );
    console.groupEnd();

    if (report.performance.pageLoad) {
      console.group("⚡ 性能指标");
      console.log(`页面加载: ${report.performance.pageLoad}ms`);
      console.log(`首字节时间: ${report.performance.ttfb}ms`);
      console.log(`LCP: ${report.performance.lcp}ms`);
      console.log(`CLS: ${report.performance.cls}`);
      console.log(`FID: ${report.performance.fid}ms`);
      console.groupEnd();
    }

    console.group("🎯 SEO评分");
    console.log(`SEO得分: ${report.seo.audit?.score}%`);
    console.log(`可访问性得分: ${report.accessibility.score}%`);
    console.groupEnd();

    if (report.suggestions.length > 0) {
      console.group("💡 优化建议");
      report.suggestions.forEach((suggestion) => {
        const icon =
          suggestion.level === "high"
            ? "🔴"
            : suggestion.level === "medium"
              ? "🟡"
              : "🟢";
        console.log(
          `${icon} [${suggestion.type.toUpperCase()}] ${suggestion.message}`,
        );
        console.log(`   💡 建议: ${suggestion.action}`);
      });
      console.groupEnd();
    } else {
      console.log("🎉 页面SEO配置优秀，暂无优化建议！");
    }

    console.groupEnd();

    return report;
  }

  // 导出详细报告
  exportDetailedReport() {
    const report = this.reportData;
    const timestamp = new Date().toISOString().split("T")[0];

    const detailedReport = `
# CellStack SEO 性能报告
生成时间: ${new Date(report.timestamp).toLocaleString("zh-CN")}
页面URL: ${report.url}

## 📄 页面基础信息
- **页面标题**: "${report.seo.basic.title.content}"
  - 长度: ${report.seo.basic.title.length} 字符 ${report.seo.basic.title.isOptimal ? "✅" : "❌"}
  - 建议: 30-60字符为最佳

- **页面描述**: "${report.seo.basic.description.content}"
  - 长度: ${report.seo.basic.description.length} 字符 ${report.seo.basic.description.isOptimal ? "✅" : "❌"}
  - 建议: 120-160字符为最佳

- **标题结构**:
  - H1标签: ${report.seo.basic.headings.h1Count}个 ${report.seo.basic.headings.isValid ? "✅" : "❌"}
  - 总标题数: ${report.seo.basic.headings.total}个

- **图片优化**:
  - 总数: ${report.seo.basic.images.total}张
  - 已优化: ${report.seo.basic.images.withAlt}张 (${report.seo.basic.images.optimizationRate}%)
  - 缺少alt: ${report.seo.basic.images.withoutAlt}张

- **链接分析**:
  - 内部链接: ${report.seo.basic.links.internal}个
  - 外部链接: ${report.seo.basic.links.external}个

## ⚡ 性能指标
${
  report.performance.pageLoad
    ? `
- 页面加载时间: ${report.performance.pageLoad}ms
- 首字节时间(TTFB): ${report.performance.ttfb}ms
- 最大内容绘制(LCP): ${report.performance.lcp}ms
- 累积布局偏移(CLS): ${report.performance.cls}
- 首次输入延迟(FID): ${report.performance.fid}ms
`
    : "性能数据收集中..."
}

## 🎯 评分总结
- SEO得分: ${report.seo.audit?.score || "N/A"}%
- 可访问性得分: ${report.accessibility.score || "N/A"}%

## 💡 优化建议
${
  report.suggestions.length > 0
    ? report.suggestions
        .map(
          (s) => `
### ${s.level === "high" ? "🔴 高优先级" : s.level === "medium" ? "🟡 中优先级" : "🟢 低优先级"} - ${s.type.toUpperCase()}
**问题**: ${s.message}
**建议**: ${s.action}
`,
        )
        .join("")
    : "🎉 恭喜！当前页面SEO配置优秀，暂无优化建议。"
}

---
*报告由 CellStack SEO Reporter 自动生成*
    `.trim();

    // 输出到控制台
    console.log(detailedReport);

    // 创建下载链接
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost"
    ) {
      const blob = new Blob([detailedReport], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cellstack-seo-report-${timestamp}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("📄 详细报告已下载为 Markdown 文件");
    }

    return detailedReport;
  }

  // 实时监控核心指标
  startRealTimeMonitoring() {
    console.log("🔄 启动SEO实时监控...");

    // 每30秒检查一次性能
    const performanceMonitor = setInterval(() => {
      if (document.visibilityState === "visible") {
        this.checkPerformance();
      }
    }, 30000);

    // 页面可见性变化时检查
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => {
          this.analyzePage();
        }, 1000);
      }
    });

    // 滚动深度追踪
    let maxScroll = 0;
    window.addEventListener("scroll", () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100,
      );
      maxScroll = Math.max(maxScroll, scrollPercent);

      // 记录重要里程碑
      if (scrollPercent >= 25 && !window.cellstackTracked25) {
        window.cellstackTracked25 = true;
        console.log("📊 用户滚动到25%");
      }
      if (scrollPercent >= 50 && !window.cellstackTracked50) {
        window.cellstackTracked50 = true;
        console.log("📊 用户滚动到50%");
      }
      if (scrollPercent >= 75 && !window.cellstackTracked75) {
        window.cellstackTracked75 = true;
        console.log("📊 用户滚动到75%");
      }
    });

    return () => {
      clearInterval(performanceMonitor);
    };
  }

  // 快速SEO健康检查
  static quickHealthCheck() {
    const issues = [];

    // 基础检查
    if (!document.title || document.title.length < 10) {
      issues.push("页面标题过短或缺失");
    }

    if (!document.querySelector('meta[name="description"]')) {
      issues.push("缺少页面描述");
    }

    if (document.querySelectorAll("h1").length !== 1) {
      issues.push("H1标签数量不正确");
    }

    if (document.querySelectorAll("img:not([alt])").length > 0) {
      issues.push("存在缺少alt属性的图片");
    }

    if (!document.querySelector('link[rel="canonical"]')) {
      issues.push("缺少canonical链接");
    }

    if (issues.length === 0) {
      console.log("✅ SEO健康检查通过！");
      return true;
    } else {
      console.warn("⚠️ SEO健康检查发现问题:", issues);
      return false;
    }
  }
}

// 全局SEO报告器 - 仅在客户端环境下初始化
if (typeof window !== "undefined") {
  window.CellStackSEO = {
    // 生成完整报告
    generateReport: async () => {
      const reporter = new SEOReporter();
      const report = await reporter.generateReport();
      return reporter.printReport();
    },

    // 导出详细报告
    exportReport: async () => {
      const reporter = new SEOReporter();
      await reporter.generateReport();
      return reporter.exportDetailedReport();
    },

    // 快速健康检查
    healthCheck: () => SEOReporter.quickHealthCheck(),

    // 启动监控
    startMonitoring: () => {
      const reporter = new SEOReporter();
      return reporter.startRealTimeMonitoring();
    },
  };

  // 开发环境下自动进行健康检查
  if (window.location.hostname === "localhost") {
    setTimeout(() => {
      console.log("🚀 CellStack SEO 工具已加载");
      console.log("💡 使用 window.CellStackSEO.generateReport() 生成报告");
      console.log("💡 使用 window.CellStackSEO.healthCheck() 进行快速检查");

      // 自动执行健康检查
      SEOReporter.quickHealthCheck();
    }, 2000);
  }
}

export default SEOReporter;
