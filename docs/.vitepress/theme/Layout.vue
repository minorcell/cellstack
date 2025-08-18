<template>
  <Layout>
    <!-- 在导航栏的社交链接区域后添加分享按钮 -->
    <template #nav-bar-content-after>
      <div class="VPNavBarExtra">
        <ShareButton />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ShareButton from './components/ShareButton.vue'

const { Layout } = DefaultTheme
</script>

<style scoped>
.VPNavBarExtra {
  display: flex;
  align-items: center;
  margin-left: 8px;
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