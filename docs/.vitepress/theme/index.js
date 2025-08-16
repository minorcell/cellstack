// VitePress 主题入口文件
import DefaultTheme from "vitepress/theme";
import "./custom.css";
import mediumZoom from 'medium-zoom';
import { onMounted, watch, nextTick } from 'vue';
import { useRoute, inBrowser, useData } from 'vitepress';
import busuanzi from 'busuanzi.pure.js'
import { NProgress } from 'nprogress-v2/dist/index.js'
import giscusTalk from 'vitepress-plugin-comment-with-giscus';

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    if (inBrowser) {
      router.onAfterRouteChanged = () => {
        busuanzi.fetch()
      }
      NProgress.configure({ showSpinner: false })
      router.onBeforeRouteChange = () => {
        NProgress.start() // 开始进度条
      }
      router.onAfterRouteChanged = () => {
        busuanzi.fetch()
        NProgress.done() // 停止进度条
      }
    }
  },
  setup() {
    const route = useRoute();
    const initZoom = () => {
      // mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' }); // 默认
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' }); // 不显式添加{data-zoomable}的情况下为所有图像启用此功能
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );

    const { frontmatter, isDark } = useData();

    // 更新 giscus 主题的函数
    const updateGiscusTheme = (theme) => {
      if (!inBrowser) return;

      const sendMessage = () => {
        const iframe = document.querySelector('iframe.giscus-frame');
        if (iframe) {
          iframe.contentWindow.postMessage({
            giscus: {
              setConfig: {
                theme: theme
              }
            }
          }, 'https://giscus.app');
        }
      };

      // 立即尝试发送
      sendMessage();

      // 如果 iframe 还没加载完成，延迟发送
      setTimeout(sendMessage, 100);
      setTimeout(sendMessage, 500);
      setTimeout(sendMessage, 1000);
    };

    // 监听主题变化并更新 giscus 主题
    watch(isDark, (newVal) => {
      const theme = newVal ? 'noborder_dark' : 'noborder_light';
      updateGiscusTheme(theme);
    });

    giscusTalk({
      repo: 'minorcell/cellstack',
      repoId: 'R_kgDOPdW_4w',
      category: 'General',
      categoryId: 'DIC_kwDOPdW_484CuOIM',
      mapping: 'pathname',
      inputPosition: 'bottom',
      lang: 'zh-CN',
      theme: isDark.value ? 'noborder_dark' : 'noborder_light'
    },
      {
        frontmatter, route
      },
      true
    );
  },
};
