// VitePress 主题入口文件
import DefaultTheme from "vitepress/theme";
import "./custom.css";
import HandDrawnIllustration from "./components/HandDrawnIllustration.vue";
import PageLayout from "./components/PageLayout.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component("HandDrawnIllustration", HandDrawnIllustration);
    app.component("PageLayout", PageLayout);
  },
};
