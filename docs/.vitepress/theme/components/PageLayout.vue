<template>
  <div class="enhanced-page-layout">
    <!-- 页面顶部装饰 -->
    <div class="page-decoration top-decoration">
      <HandDrawnIllustration
        variant="abstract"
        :width="120"
        :height="40"
        color-scheme="default"
      />
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <slot />
    </div>

    <!-- 页面底部装饰 -->
    <div class="page-decoration bottom-decoration">
      <div class="handdrawn-separator">
        <svg width="200" height="20" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 10 C30 5, 50 15, 70 10 C90 5, 110 15, 130 10 C150 5, 170 15, 190 10"
            stroke="#a0896b"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>

    <!-- 浮动的装饰元素 -->
    <div class="floating-decorations">
      <div class="decoration-dot dot-1"></div>
      <div class="decoration-dot dot-2"></div>
      <div class="decoration-dot dot-3"></div>
      <div class="decoration-line line-1"></div>
      <div class="decoration-line line-2"></div>
    </div>
  </div>
</template>

<script setup>
import HandDrawnIllustration from './HandDrawnIllustration.vue'
</script>

<style scoped>
.enhanced-page-layout {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 30%, rgba(212, 196, 168, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(160, 137, 107, 0.03) 0%, transparent 50%);
}

.page-decoration {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  opacity: 0.7;
}

.top-decoration {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.bottom-decoration {
  margin-top: 3rem;
  margin-bottom: 2rem;
}

.content-wrapper {
  position: relative;
  z-index: 1;
}

.handdrawn-separator {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.handdrawn-separator svg {
  animation: gentleFloat 4s ease-in-out infinite;
}

/* 浮动装饰元素 */
.floating-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decoration-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: var(--vp-c-brand-3);
  border-radius: 50%;
  opacity: 0.3;
  animation: floatAndFade 8s ease-in-out infinite;
}

.decoration-line {
  position: absolute;
  width: 20px;
  height: 1px;
  background-color: var(--vp-c-brand-2);
  opacity: 0.2;
  animation: floatAndRotate 12s linear infinite;
}

.dot-1 {
  top: 20%;
  right: 10%;
  animation-delay: 0s;
}

.dot-2 {
  top: 60%;
  left: 8%;
  animation-delay: 3s;
}

.dot-3 {
  top: 80%;
  right: 15%;
  animation-delay: 6s;
}

.line-1 {
  top: 30%;
  left: 5%;
  animation-delay: 2s;
}

.line-2 {
  top: 70%;
  right: 8%;
  animation-delay: 5s;
}

/* 动画定义 */
@keyframes gentleFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes floatAndFade {
  0%, 100% {
    opacity: 0.1;
    transform: translateY(0px) scale(1);
  }
  50% {
    opacity: 0.4;
    transform: translateY(-20px) scale(1.2);
  }
}

@keyframes floatAndRotate {
  0% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.3;
  }
  100% {
    transform: translateY(0px) rotate(360deg);
    opacity: 0.1;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-decoration {
    padding: 0.5rem 0;
  }

  .top-decoration {
    margin-top: 1rem;
  }

  .floating-decorations {
    display: none; /* 在小屏幕上隐藏浮动装饰 */
  }

  .handdrawn-separator svg {
    width: 150px;
    height: 15px;
  }
}

/* 暗色模式适配 */
.dark .decoration-dot {
  background-color: var(--vp-c-brand-2);
}

.dark .decoration-line {
  background-color: var(--vp-c-brand-1);
}

.dark .enhanced-page-layout {
  background:
    radial-gradient(circle at 20% 30%, rgba(212, 196, 168, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(160, 137, 107, 0.02) 0%, transparent 50%);
}
</style>
