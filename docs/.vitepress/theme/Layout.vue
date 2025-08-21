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
          @click.prevent="
            handleExternalLink('https://github.com/minorcell/cellstack', $event)
          "
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
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import DefaultTheme from "vitepress/theme";
import ThemeSettings from "./components/ThemeSettings.vue";

const { Layout } = DefaultTheme;

const showWarning = ref(false);
const warningUrl = ref("");
const warningCallback = ref<(() => void) | null>(null);

// 判断是否为外部链接
const isExternalLink = (url: string): boolean => {
  try {
    const currentHost = window.location.host;
    const linkHost = new URL(url).host;
    return currentHost !== linkHost;
  } catch {
    return false;
  }
};

// 显示警告弹窗
const showExternalWarning = (url: string, callback: () => void) => {
  const overlay = document.createElement("div");
  overlay.className = "external-link-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease-out;
  `;

  overlay.innerHTML = `
    <div class="external-link-modal" style="
      background: var(--vp-c-bg);
      width: 90vw;
      max-width: 520px;
      border-radius: 16px;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 28px 20px;
        background: var(--vp-c-bg-soft);
      ">
        <div style="color: #f59e0b; flex-shrink: 0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--vp-c-text-1);">即将离开 CellStack</h3>
      </div>

      <div style="padding: 20px 28px;">
        <p style="margin: 0 0 12px 0; font-size: 15px; color: var(--vp-c-text-1); font-weight: 500;">您即将访问外部链接：</p>
        <div style="
          background: var(--vp-c-bg-soft);
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          border-left: 3px solid var(--theme-primary, #FF8C59);
        ">
          <span style="font-family: monospace; font-size: 14px; color: var(--vp-c-text-2); word-break: break-all;">${url}</span>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 15px; color: var(--vp-c-text-1); font-weight: 500;">请注意：</p>
        <ul style="margin: 0; padding-left: 20px; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.6;">
          <li style="margin-bottom: 4px;">外部网站的内容不受 CellStack 控制</li>
          <li style="margin-bottom: 4px;">请注意保护您的个人信息安全</li>
          <li style="margin-bottom: 4px;">建议您仔细核实链接的安全性</li>
        </ul>
      </div>

      <div style="
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 20px 28px 24px;
        background: var(--vp-c-bg-soft);
      ">
        <button id="cancel-btn" style="
          padding: 10px 24px;
          border: 1px solid var(--vp-c-divider);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          background: var(--vp-c-bg);
          color: var(--vp-c-text-2);
          transition: all 0.25s ease;
        ">取消</button>
        <button id="continue-btn" style="
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          background: var(--theme-primary, #FF8C59);
          color: white;
          transition: all 0.25s ease;
        ">继续访问</button>
      </div>
    </div>
  `;

  const closeOverlay = () => {
    overlay.remove();
  };

  const continueAction = () => {
    callback();
    closeOverlay();
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  overlay.querySelector("#cancel-btn")?.addEventListener("click", closeOverlay);
  overlay
    .querySelector("#continue-btn")
    ?.addEventListener("click", continueAction);

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        closeOverlay();
      }
    },
    { once: true }
  );

  document.body.appendChild(overlay);
};

// 关闭警告弹窗
const closeWarning = () => {
  showWarning.value = false;
  warningUrl.value = "";
  warningCallback.value = null;
};

// 处理外部链接点击
const handleExternalLink = (url: string, event: Event) => {
  if (isExternalLink(url)) {
    event.preventDefault();
    showExternalWarning(url, () => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }
};

// 全局监听所有外部链接点击
const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const link = target.closest("a");

  if (link && link.href && isExternalLink(link.href)) {
    if (link.getAttribute("data-external-handled") !== "true") {
      event.preventDefault();
      showExternalWarning(link.href, () => {
        window.open(link.href, "_blank", "noopener,noreferrer");
      });
    }
  }
};

// ESC键关闭弹窗
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showWarning.value) {
    closeWarning();
  }
};

onMounted(() => {
  setTimeout(() => {
    const navLinks = document.querySelectorAll(
      '.VPNavBarExtra a[href^="http"]'
    );
    navLinks.forEach((link) => {
      link.setAttribute("data-external-handled", "true");
    });

    document.addEventListener("click", handleGlobalClick, true);
    document.addEventListener("keydown", handleEscKey);
  }, 0);
});

onUnmounted(() => {
  document.removeEventListener("click", handleGlobalClick, true);
  document.removeEventListener("keydown", handleEscKey);
});
</script>

<style scoped>
.VPNavBarExtra {
  display: flex;
  align-items: center;
  gap: 4px;
}

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
    display: none;
  }
}
</style>
