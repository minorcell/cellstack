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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            >
              <path
                d="M9.096 21.25v-3.146a3.33 3.33 0 0 1 .758-2.115c-3.005-.4-5.28-1.859-5.28-5.798c0-1.666 1.432-3.89 1.432-3.89c-.514-1.13-.5-3.084.06-3.551c0 0 1.95.175 3.847 1.75c1.838-.495 3.764-.554 5.661 0c1.897-1.575 3.848-1.75 3.848-1.75c.558.467.573 2.422.06 3.551c0 0 1.432 2.224 1.432 3.89c0 3.94-2.276 5.398-5.28 5.798a3.33 3.33 0 0 1 .757 2.115v3.146"
              />
              <path
                d="M3.086 16.57c.163.554.463 1.066.878 1.496c.414.431.932.77 1.513.988a4.46 4.46 0 0 0 3.62-.216"
              />
            </g>
          </svg>
        </a>

        <ThemeSettings />
        <ShareButton />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import ShareButton from "./components/ShareButton.vue";
import ThemeSettings from "./components/ThemeSettings.vue";

const { Layout } = DefaultTheme;
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
