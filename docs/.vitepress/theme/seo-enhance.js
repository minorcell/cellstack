// SEO Enhancement Script for CellStack
// 高级SEO优化和用户体验增强

export function enhanceSEO() {
  // SSR兼容性检查
  if (typeof window === "undefined") {
    return { init: () => {} };
  }
  // 1. 动态Meta标签优化
  function updatePageMeta() {
    const currentPath = window.location.pathname;
    const pageTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');

    // 根据页面类型动态优化描述
    if (currentPath.includes("/language-basics/")) {
      updateMetaContent(
        "description",
        `${pageTitle} - 深入学习编程语言基础，包括JavaScript、TypeScript、Python、Go等核心语法和最佳实践 | CellStack`,
      );
      updateMetaContent(
        "keywords",
        "编程语言基础,JavaScript教程,TypeScript进阶,Python实践,Go语言,语法学习,编程入门",
      );
    } else if (currentPath.includes("/engineering-practice/")) {
      updateMetaContent(
        "description",
        `${pageTitle} - 全栈工程实践指南，前端工程化、后端架构设计、DevOps运维、AI工程落地经验分享 | CellStack`,
      );
      updateMetaContent(
        "keywords",
        "工程实践,前端工程化,后端架构,DevOps,AI工程,系统设计,微服务,容器化",
      );
    } else if (currentPath.includes("/blog/")) {
      updateMetaContent(
        "description",
        `${pageTitle} - 技术博客文章，分享最新的开发经验、技术趋势和项目实战案例 | CellStack`,
      );
      updateMetaContent(
        "keywords",
        "技术博客,开发经验,技术趋势,项目实战,编程技巧,最佳实践",
      );
    }

    // 更新Open Graph数据
    updateMetaProperty("og:title", pageTitle);
    updateMetaProperty("og:url", window.location.href);
    updateMetaProperty("twitter:title", pageTitle);
  }

  function updateMetaContent(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }

  function updateMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("property", property);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }

  // 2. 结构化数据增强
  function addBreadcrumbSchema() {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) return;

    const breadcrumbItems = [
      { name: "CellStack", url: "https://stack.mcell.top" },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      breadcrumbItems.push({
        name: name,
        url: "https://stack.mcell.top" + currentPath,
      });
    });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    addJsonLdSchema("breadcrumb-schema", breadcrumbSchema);
  }

  function addArticleSchema() {
    const title = document.querySelector("h1")?.textContent;
    const description = document.querySelector(
      'meta[name="description"]',
    )?.content;
    const lastUpdated = document
      .querySelector(".VPDocFooterLastUpdated time")
      ?.getAttribute("datetime");

    if (title && window.location.pathname.includes("/blog/")) {
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: title,
        description: description || title,
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
            url: "https://stack.mcell.top/logo-simple.svg",
          },
        },
        datePublished: lastUpdated || new Date().toISOString(),
        dateModified: lastUpdated || new Date().toISOString(),
        url: window.location.href,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": window.location.href,
        },
        inLanguage: "zh-CN",
        keywords: extractKeywordsFromContent(),
        about: [
          { "@type": "Thing", name: "软件工程" },
          { "@type": "Thing", name: "编程技术" },
          { "@type": "Thing", name: "开发实践" },
        ],
      };

      addJsonLdSchema("article-schema", articleSchema);
    }
  }

  function addJsonLdSchema(id, schema) {
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }

  function extractKeywordsFromContent() {
    const content = document.querySelector(".VPDoc")?.textContent || "";
    const techKeywords = [
      "JavaScript",
      "TypeScript",
      "Python",
      "Go",
      "React",
      "Vue",
      "Node.js",
      "Docker",
      "Kubernetes",
      "DevOps",
      "AI",
      "机器学习",
      "深度学习",
      "前端",
      "后端",
      "全栈",
      "微服务",
      "系统设计",
      "数据库",
      "API",
      "性能优化",
      "安全",
      "测试",
      "CI/CD",
      "云原生",
    ];

    return techKeywords
      .filter((keyword) =>
        content.toLowerCase().includes(keyword.toLowerCase()),
      )
      .slice(0, 10);
  }

  // 3. 性能优化
  function optimizeImages() {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.getAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      if (!img.getAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
      // 添加图片alt属性优化
      if (!img.alt && img.src) {
        const filename = img.src.split("/").pop().split(".")[0];
        img.alt = `CellStack ${filename} 技术图解`;
      }
    });
  }

  // 4. 核心Web指标优化
  function optimizeCoreWebVitals() {
    // 预加载关键资源
    const criticalResources = ["/logo-simple.svg"];

    criticalResources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource;
      link.as = resource.endsWith(".svg") ? "image" : "fetch";
      document.head.appendChild(link);
    });

    // 字体优化
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    fontLink.as = "style";
    fontLink.onload = function () {
      this.onload = null;
      this.rel = "stylesheet";
    };
    document.head.appendChild(fontLink);
  }

  // 5. 用户体验增强
  function enhanceUserExperience() {
    // 平滑滚动
    document.documentElement.style.scrollBehavior = "smooth";

    // 外部链接优化
    const externalLinks = document.querySelectorAll(
      'a[href^="http"]:not([href*="cellstack.dev"])',
    );
    externalLinks.forEach((link) => {
      link.setAttribute("rel", "noopener noreferrer");
      link.setAttribute("target", "_blank");

      // 添加外部链接图标
      if (!link.querySelector(".external-link-icon")) {
        const icon = document.createElement("span");
        icon.className = "external-link-icon";
        icon.innerHTML = " ↗";
        icon.style.opacity = "0.6";
        icon.style.fontSize = "0.8em";
        link.appendChild(icon);
      }
    });

    // 阅读进度条
    addReadingProgress();
  }

  function addReadingProgress() {
    if (document.querySelector(".reading-progress")) return;

    const progressBar = document.createElement("div");
    progressBar.className = "reading-progress";
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #b59f82, #8b7355);
      z-index: 1000;
      transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener("scroll", () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + "%";
    });
  }

  // 6. 搜索引擎优化增强
  function enhanceSearchability() {
    // 为代码块添加语言标识
    const codeBlocks = document.querySelectorAll('pre[class*="language-"]');
    codeBlocks.forEach((block) => {
      const language = block.className.match(/language-(\w+)/)?.[1];
      if (language && !block.getAttribute("data-language")) {
        block.setAttribute("data-language", language);
        block.setAttribute("aria-label", `${language} 代码示例`);
      }
    });

    // 为标题添加锚点ID（如果没有的话）
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((heading) => {
      if (!heading.id) {
        const id = heading.textContent
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
        heading.id = id;
      }
    });
  }

  // 7. 分析和监控
  function addAnalytics() {
    // 页面加载性能监控
    if ("performance" in window) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType("navigation")[0];
          if (perfData) {
            console.log("页面性能指标:", {
              DNS查询: Math.round(
                perfData.domainLookupEnd - perfData.domainLookupStart,
              ),
              TCP连接: Math.round(perfData.connectEnd - perfData.connectStart),
              首字节时间: Math.round(
                perfData.responseStart - perfData.requestStart,
              ),
              页面加载: Math.round(
                perfData.loadEventEnd - perfData.navigationStart,
              ),
              DOMContentLoaded: Math.round(
                perfData.domContentLoadedEventEnd - perfData.navigationStart,
              ),
            });
          }
        }, 0);
      });
    }

    // 用户行为跟踪（隐私友好）
    trackUserEngagement();
  }

  function trackUserEngagement() {
    let scrollDepth = 0;
    let timeOnPage = Date.now();

    window.addEventListener("scroll", () => {
      const currentScroll = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100,
      );
      scrollDepth = Math.max(scrollDepth, currentScroll);
    });

    window.addEventListener("beforeunload", () => {
      const sessionTime = Date.now() - timeOnPage;
      // 这里可以发送到分析服务，但要符合隐私规范
      console.log("用户参与度:", {
        页面停留时间: Math.round(sessionTime / 1000) + "秒",
        滚动深度: scrollDepth + "%",
        页面: window.location.pathname,
      });
    });
  }

  // 8. 错误监控和SEO健康检查
  function monitorSEOHealth() {
    const issues = [];

    // 检查必要的meta标签
    const requiredMetas = ["description", "viewport", "author"];
    requiredMetas.forEach((meta) => {
      if (!document.querySelector(`meta[name="${meta}"]`)) {
        issues.push(`缺少meta标签: ${meta}`);
      }
    });

    // 检查图片alt属性
    const imagesWithoutAlt = document.querySelectorAll("img:not([alt])");
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length}张图片缺少alt属性`);
    }

    // 检查标题结构
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let h1Count = document.querySelectorAll("h1").length;
    if (h1Count !== 1) {
      issues.push(`页面应该有且仅有一个H1标签，当前有${h1Count}个`);
    }

    // 检查内部链接
    const internalLinks = document.querySelectorAll(
      'a[href^="/"], a[href^="./"], a[href^="../"]',
    );
    internalLinks.forEach((link) => {
      if (!link.getAttribute("title") && link.textContent.length > 30) {
        link.setAttribute("title", link.textContent.substring(0, 50) + "...");
      }
    });

    if (issues.length > 0 && process.env.NODE_ENV === "development") {
      console.warn("SEO优化建议:", issues);
    }
  }

  // 9. 网站地图动态更新提示
  function suggestSitemapUpdate() {
    const lastUpdate = localStorage.getItem("cellstack-last-sitemap-update");
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (!lastUpdate || now - parseInt(lastUpdate) > oneWeek) {
      if (process.env.NODE_ENV === "development") {
        console.info("建议更新sitemap.xml以提高搜索引擎发现能力");
      }
      localStorage.setItem("cellstack-last-sitemap-update", now.toString());
    }
  }

  // 10. 社交媒体分享优化
  function addSocialSharing() {
    const shareData = {
      title: document.title,
      text: document.querySelector('meta[name="description"]')?.content || "",
      url: window.location.href,
    };

    // 如果支持Web Share API
    if (navigator.share) {
      window.cellstackShare = () => {
        navigator.share(shareData).catch((err) => {
          console.log("分享取消:", err);
        });
      };
    }

    // 为特定页面添加结构化数据
    if (window.location.pathname.includes("/blog/")) {
      addBlogPostSchema();
    }
  }

  function addBlogPostSchema() {
    const title = document.querySelector("h1")?.textContent;
    const content = document.querySelector(".VPDoc")?.textContent;
    const wordCount = content ? content.split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200); // 假设200字/分钟

    if (title) {
      const blogSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description: document.querySelector('meta[name="description"]')
          ?.content,
        author: {
          "@type": "Person",
          name: "CellStack Team",
        },
        publisher: {
          "@type": "Organization",
          name: "CellStack",
          logo: {
            "@type": "ImageObject",
            url: "https://stack.mcell.top/logo-simple.svg",
          },
        },
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        url: window.location.href,
        wordCount: wordCount,
        timeRequired: `PT${readingTime}M`,
        inLanguage: "zh-CN",
        isAccessibleForFree: true,
        genre: ["Technology", "Software Development", "Engineering"],
        audience: {
          "@type": "Audience",
          audienceType: "Software Engineers",
        },
      };

      addJsonLdSchema("blog-post-schema", blogSchema);
    }
  }

  // 11. 可访问性增强
  function enhanceAccessibility() {
    // 跳转到内容链接
    if (!document.querySelector(".skip-to-content")) {
      const skipLink = document.createElement("a");
      skipLink.href = "#main-content";
      skipLink.className = "skip-to-content";
      skipLink.textContent = "跳转到主要内容";
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #8b7355;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      `;

      skipLink.addEventListener("focus", () => {
        skipLink.style.top = "6px";
      });

      skipLink.addEventListener("blur", () => {
        skipLink.style.top = "-40px";
      });

      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // 为主要内容区域添加landmark
    const mainContent =
      document.querySelector(".VPDoc") || document.querySelector(".VPHome");
    if (mainContent && !mainContent.id) {
      mainContent.id = "main-content";
      mainContent.setAttribute("role", "main");
    }
  }

  // 12. 搜索引擎爬虫友好性
  function enhanceCrawlerFriendliness() {
    // 为导航添加语义化标记
    const nav = document.querySelector(".VPNav");
    if (nav && !nav.getAttribute("role")) {
      nav.setAttribute("role", "navigation");
      nav.setAttribute("aria-label", "主导航");
    }

    // 为搜索添加语义化
    const searchButton = document.querySelector(".DocSearch-Button");
    if (searchButton) {
      searchButton.setAttribute("aria-label", "搜索CellStack技术文档");
    }

    // 添加页面类型标识
    const body = document.body;
    const path = window.location.pathname;
    if (path === "/") {
      body.setAttribute("data-page-type", "homepage");
    } else if (path.includes("/blog/")) {
      body.setAttribute("data-page-type", "blog");
    } else if (path.includes("/language-basics/")) {
      body.setAttribute("data-page-type", "tutorial");
    } else if (path.includes("/engineering-practice/")) {
      body.setAttribute("data-page-type", "guide");
    }
  }

  // 13. 初始化所有SEO优化
  function init() {
    // DOM加载完成后执行
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runOptimizations);
    } else {
      runOptimizations();
    }

    // 路由变化时重新执行优化
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        setTimeout(runOptimizations, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function runOptimizations() {
    updatePageMeta();
    addBreadcrumbSchema();
    addArticleSchema();
    optimizeImages();
    optimizeCoreWebVitals();
    enhanceUserExperience();
    addSocialSharing();
    enhanceAccessibility();
    enhanceCrawlerFriendliness();
    monitorSEOHealth();
    suggestSitemapUpdate();
  }

  return { init };
}

// 仅在客户端执行SEO优化
if (typeof window !== "undefined") {
  // 等待DOM完全加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const seoEnhancer = enhanceSEO();
      seoEnhancer.init();
    });
  } else {
    const seoEnhancer = enhanceSEO();
    seoEnhancer.init();
  }
}
