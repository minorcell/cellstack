// VitePress 主题入口文件
import DefaultTheme from "vitepress/theme";
import "./custom.css";
import HandDrawnIllustration from "./components/HandDrawnIllustration.vue";
import PageLayout from "./components/PageLayout.vue";
import { enhanceSEO } from "./seo-enhance.js";
import SEOReporter from "./seo-report.js";

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component("HandDrawnIllustration", HandDrawnIllustration);
    app.component("PageLayout", PageLayout);

    // 初始化SEO优化
    if (typeof window !== "undefined") {
      const seoEnhancer = enhanceSEO();
      seoEnhancer.init();

      // 路由变化时重新执行SEO优化
      router.onAfterRouteChanged = (to) => {
        setTimeout(() => {
          seoEnhancer.init();

          // 在开发环境下自动执行SEO检查
          if (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
          ) {
            setTimeout(() => {
              window.CellStackSEO?.healthCheck();
            }, 1000);
          }
        }, 100);
      };

      // 页面完全加载后初始化SEO报告工具
      window.addEventListener("load", () => {
        setTimeout(() => {
          // 全局SEO工具已在seo-report.js中定义
          if (window.CellStackSEO) {
            console.log("🚀 CellStack SEO工具已就绪");
            console.log("💡 在控制台输入以下命令使用:");
            console.log(
              "   window.CellStackSEO.generateReport() - 生成完整SEO报告",
            );
            console.log("   window.CellStackSEO.healthCheck() - 快速健康检查");
            console.log("   window.CellStackSEO.exportReport() - 导出详细报告");
          }
        }, 2000);
      });
    }
  },

  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 在页面底部添加SEO信息（仅开发环境）
      "doc-after": () => {
        if (
          typeof window !== "undefined" &&
          window.location.hostname === "localhost"
        ) {
          return h(
            "div",
            {
              style: {
                marginTop: "2rem",
                padding: "1rem",
                background: "var(--vp-c-bg-alt)",
                borderRadius: "8px",
                fontSize: "0.875rem",
                color: "var(--vp-c-text-2)",
                border: "1px solid var(--vp-c-border)",
              },
            },
            [
              h(
                "div",
                { style: { fontWeight: "600", marginBottom: "0.5rem" } },
                "🔍 SEO开发工具",
              ),
              h(
                "div",
                {},
                "在浏览器控制台输入 window.CellStackSEO.generateReport() 生成SEO报告",
              ),
            ],
          );
        }
        return null;
      },
    });
  },
};

// 动态导入h函数
import { h } from "vue";
