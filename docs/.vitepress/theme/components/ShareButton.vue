<template>
  <div class="share-button-container">
    <!-- 分享按钮 -->
    <button class="share-button" @click="toggleModal" :title="'分享此页面'">
      <svg
        class="share-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0m12-6a3 3 0 1 0 6 0a3 3 0 1 0-6 0m0 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0m-6.3-7.3l6.6-3.4m-6.6 6l6.6 3.4"
        />
      </svg>
    </button>

    <!-- 弹窗遮罩 -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="share-modal-overlay" @click="closeModal">
        <div class="share-modal" @click.stop>
          <!-- 弹窗头部 -->
          <div class="share-modal-header">
            <h3 class="share-modal-title">分享此页面</h3>
            <button class="share-modal-close" @click="closeModal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 20 20"
              >
                <path
                  fill="currentColor"
                  d="M10 8.586L2.929 1.515L1.515 2.929L8.586 10l-7.071 7.071l1.414 1.414L10 11.414l7.071 7.071l1.414-1.414L11.414 10l7.071-7.071l-1.414-1.414z"
                />
              </svg>
            </button>
          </div>

          <!-- 分享选项列表 -->
          <div class="share-options">
            <!-- 复制链接 -->
            <button class="share-option" @click="copyLink">
              <div class="share-option-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="128"
                  height="128"
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  >
                    <path
                      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    />
                    <path
                      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    />
                  </g>
                </svg>
              </div>
              <div class="share-option-text">
                <div class="share-option-name">复制链接</div>
                <div class="share-option-desc">复制当前页面链接</div>
              </div>
            </button>

            <!-- 分享卡片 -->
            <button
              class="share-option"
              @click="generateCard"
              :disabled="isGeneratingCard"
            >
              <div class="share-option-icon">
                <svg
                  v-if="!isGeneratingCard"
                  xmlns="http://www.w3.org/2000/svg"
                  width="128"
                  height="128"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 15h-2v-2h2zm6 0h-4v-2h4zM8 11H6V9h2zm10 0h-8V9h8zm2 9H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2M4 6v12h16V6z"
                  />
                </svg>
                <svg
                  v-else
                  class="loading-spinner"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div class="share-option-text">
                <div class="share-option-name">
                  {{ isGeneratingCard ? "生成中..." : "分享卡片" }}
                </div>
                <div class="share-option-desc">导出为分享卡片</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 操作成功提示 -->
    <Teleport to="body">
      <div v-if="showCopyToast" class="copy-toast">
        <svg
          class="copy-toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ toastMessage }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useData } from "vitepress";

const { page } = useData();

// 响应式状态
const isModalOpen = ref(false);
const showCopyToast = ref(false);
const isGeneratingCard = ref(false);
const toastMessage = ref("");

// 计算属性
const currentUrl = computed(() => {
  if (typeof window !== "undefined") {
    return window.location.href;
  }
  return "";
});

const pageTitle = computed(() => {
  return page.value.title || document?.title || "CellStack";
});

const pageDescription = computed(() => {
  return (
    page.value.description ||
    page.value.frontmatter?.description ||
    "计算机科学的工程实践和一些个人思考。"
  );
});

// 方法
const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const showToast = (message: string) => {
  toastMessage.value = message;
  showCopyToast.value = true;
  setTimeout(() => {
    showCopyToast.value = false;
  }, 2000);
};

const copyToClipboard = async (text: string, successMessage: string) => {
  try {
    // 优先使用现代剪贴板API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
      closeModal();
      return;
    }

    // 降级方案：使用document.execCommand
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    `;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    // 对于移动设备的兼容性
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      showToast(successMessage);
      closeModal();
    } else {
      throw new Error("execCommand failed");
    }
  } catch (err) {
    console.error("复制失败:", err);

    // 最后的降级方案：显示文本让用户手动复制
    const fallbackModal = document.createElement("div");
    fallbackModal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--vp-c-bg);
      border-radius: 8px;
      padding: 20px;
      z-index: 2002;
      max-width: 90vw;
      width: 400px;
    `;

    fallbackModal.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: var(--vp-c-text-1);">请手动复制</h3>
      <textarea readonly style="width: 100%; height: 100px; margin-bottom: 10px; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 12px; color: var(--vp-c-text-1); background: var(--vp-c-bg-soft);">${text}</textarea>
      <button style="background: var(--vp-c-brand-1); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;" onclick="this.parentElement.remove()">关闭</button>
    `;

    document.body.appendChild(fallbackModal);
    const textarea = fallbackModal.querySelector("textarea");
    textarea.focus();
    textarea.select();

    showToast("自动复制失败，请手动复制文本");
  }
};

const copyLink = async () => {
  await copyToClipboard(currentUrl.value, "链接已复制到剪贴板");
};

const generateCard = async () => {
  isGeneratingCard.value = true;

  try {
    // 动态导入需要的库
    const [html2canvas, QRCode] = await Promise.all([
      import("html2canvas").then((m) => m.default),
      import("qrcode"),
    ]);

    // 创建卡片DOM元素
    const card = await createCardElementWithQR(QRCode);
    document.body.appendChild(card);

    // 等待DOM更新和样式渲染
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 300);
      });
    });

    // 生成canvas
    const canvas = await html2canvas(card, {
      backgroundColor:
        getComputedStyle(document.documentElement)
          .getPropertyValue("--vp-c-bg")
          .trim() || "#fdfdf8",
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: 800,
      height: 450,
    });

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `${pageTitle.value}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          showToast("卡片已生成并下载");
          closeModal();
        } else {
          throw new Error("无法生成图片");
        }
      },
      "image/png",
      0.95
    );

    // 清理DOM
    document.body.removeChild(card);
  } catch (err) {
    console.error("生成卡片失败:", err);
    showToast(`生成卡片失败: ${err.message || "请稍后重试"}`);
  } finally {
    isGeneratingCard.value = false;
  }
};

const createCardElementWithQR = async (QRCode) => {
  const card = document.createElement("div");

  // 获取当前主题色彩
  const isDark = document.documentElement.classList.contains("dark");
  const backgroundColor = isDark ? "#111111" : "#fdfdf8";
  const textColor = isDark ? "#ffffff" : "#2c2c2c";
  const secondaryColor = isDark ? "#cccccc" : "#525252";

  // 生成二维码
  const qrCodeDataURL = await QRCode.toDataURL(currentUrl.value, {
    width: 180,
    margin: 1,
    color: {
      dark: textColor,
      light: backgroundColor,
    },
  });

  card.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 800px;
    height: 450px;
    background: ${backgroundColor};
    padding: 60px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
    display: flex;
    align-items: center;
    gap: 20px;
    box-sizing: border-box;
  `;

  const safeDescription =
    pageDescription.value.substring(0, 80) +
    (pageDescription.value.length > 80 ? "..." : "");

  card.innerHTML = `
    <!-- 左侧二维码区域 -->
    <div style="flex-shrink: 0; display: flex; justify-content: center; align-items: center;">
      <img src="${qrCodeDataURL}" alt="QR Code" style="width: 200px; height: 200px; border-radius: 16px; display: block;">
    </div>
    
    <!-- 右侧内容区域 -->
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; height: 100%; padding-left: 20px;">
      <!-- 头部品牌信息 -->
      <div style="margin-bottom: 20px;">
        <!-- 文章标题 -->
        <h1 style="font-size: 32px; font-weight: 700; color: ${textColor}; margin: 0 0 20px 0; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; max-height: 100px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${pageTitle.value}</h1>
        
        <!-- 文章描述 -->
        <p style="font-size: 18px; color: ${secondaryColor}; margin: 0; line-height: 1.5;">${safeDescription}</p>
      </div>
    </div>
  `;

  return card;
};

// ESC 键关闭弹窗
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isModalOpen.value) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscKey);
});
</script>

<style scoped>
.share-button-container {
  display: inline-block;
  position: relative;
}

.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.25s;
  outline: none;
  margin-left: 4px;
}

.share-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.share-modal {
  background: var(--vp-c-bg);
  width: 90vw;
  border-radius: 8px;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
  border: none;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.share-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}

.share-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.share-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.25s;
}

.share-modal-close svg {
  width: 16px;
  height: 16px;
}

.share-options {
  padding: 16px 24px 24px;
}

.share-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}

.share-option:last-child {
  margin-bottom: 0;
}

.share-option:hover {
  background: var(--vp-c-bg-soft);
}

.share-option:active {
  transform: translateY(0);
}

.share-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  margin-right: 16px;
  flex-shrink: 0;
}

.share-option-icon svg {
  width: 22px;
  height: 22px;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.share-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.share-option:disabled:hover {
  transform: none;
  background: transparent;
}

.share-option-text {
  flex: 1;
  text-align: left;
}

.share-option-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}

.share-option-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.copy-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-size: 14px;
  color: var(--vp-c-text-1);
  z-index: 2001;
  animation: toastIn 0.3s ease-out;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.copy-toast-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  color: var(--vp-c-brand);
}

@media (max-width: 640px) {
  .share-modal {
    width: 95vw;
    margin: 0 16px;
  }

  .share-modal-header {
    padding: 16px 20px;
  }

  .share-options {
    padding: 12px 20px 20px;
  }

  .share-option {
    padding: 10px 12px;
  }

  .share-option-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }

  .share-option-icon svg {
    width: 20px;
    height: 20px;
  }

  .share-option-name {
    font-size: 15px;
  }

  .share-option-desc {
    font-size: 13px;
  }
}

/* 深色模式适配 */
.dark .share-modal-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.dark .share-modal {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2);
}

.dark .copy-toast {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
</style>
