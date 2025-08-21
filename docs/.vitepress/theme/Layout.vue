<template>
  <Layout>
    <!-- 在导航栏的社交链接区域后添加功能按钮 -->
    <template #nav-bar-content-after>
      <div class="VPNavBarExtra">
        <!-- GitHub 链接 -->
        <a 
          href="https://github.com/minorcell/cellstack" 
          target="_blank" 
          rel="noopener noreferrer"
          class="github-link"
          title="GitHub"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
          </svg>
        </a>
        
        <ThemeSettings />
        <ShareButton />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ShareButton from './components/ShareButton.vue'
import ThemeSettings from './components/ThemeSettings.vue'

const { Layout } = DefaultTheme
</script>

<style scoped>
.VPNavBarExtra {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

/* GitHub 链接样式 - 统一风格 */
.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  border: none;
  border-radius: var(--border-radius-small);
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
  outline: none;
}

.github-link:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.github-link svg {
  width: 16px;
  height: 16px;
  transition: all 0.25s ease;
}

.github-link:hover svg {
  transform: scale(1.05);
}

/* 确保移动端功能区域正常显示 */
@media (max-width: 768px) {
  .VPNavBarExtra {
    margin-left: 4px;
    /* 确保不会遮挡移动端菜单按钮 */
    order: -1;
  }
  
  /* 确保移动端导航菜单和功能区正常工作 */
  .VPNavBar .container {
    position: relative;
  }
  
  /* 移除可能导致VPNavScreen无法显示的z-index设置 */
  /* 让VitePress默认的层级关系正常工作 */
}

/* 确保桌面端布局正常 */
@media (min-width: 769px) {
  .VPNavBarExtra {
    margin-left: 12px;
  }
}
</style>