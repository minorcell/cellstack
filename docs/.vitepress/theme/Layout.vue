<template>
  <Layout>
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
  margin-left: 12px;
}

@media (max-width: 768px) {
  .VPNavBarExtra {
    margin-left: 8px;
  }
}
</style>