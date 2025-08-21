<template>
  <div class="theme-settings-container">
    <!-- 主题设置按钮 -->
    <button
      class="theme-settings-button"
      @click="toggleModal"
      :title="'主题设置'"
    >
      <div class="current-theme-display">
        <div
          class="theme-color-dot"
          :style="{ backgroundColor: currentSettings.color.primary }"
        ></div>
        <svg
          class="theme-settings-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          />
        </svg>
      </div>
    </button>

    <!-- 弹窗遮罩 -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="theme-modal-overlay" @click="closeModal">
        <div class="theme-modal" @click.stop>
          <!-- 弹窗头部 -->
          <div class="theme-modal-header">
            <h3 class="theme-modal-title">主题设置</h3>
            <button class="theme-modal-close" @click="closeModal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
              >
                <path
                  fill="currentColor"
                  d="M10 8.586L2.929 1.515L1.515 2.929L8.586 10l-7.071 7.071l1.414 1.414L10 11.414l7.071 7.071l1.414-1.414L11.414 10l7.071-7.071l-1.414-1.414z"
                />
              </svg>
            </button>
          </div>

          <!-- 设置内容 -->
          <div class="theme-settings-content">
            <!-- 外观模式 -->
            <div class="setting-section">
              <h4 class="setting-title">外观模式</h4>
              <div class="appearance-options">
                <button
                  v-for="mode in appearanceModes"
                  :key="mode.name"
                  class="appearance-option"
                  :class="{ active: currentSettings.appearance === mode.name }"
                  @click="updateAppearance(mode.name)"
                >
                  <div class="appearance-icon" v-html="mode.icon"></div>
                  <span class="appearance-label">{{ mode.label }}</span>
                </button>
              </div>
            </div>

            <!-- 主题色 -->
            <div class="setting-section">
              <h4 class="setting-title">主题色</h4>

              <!-- 预设颜色选项 -->
              <div class="color-grid">
                <div
                  v-for="color in colorOptions"
                  :key="color.name"
                  class="color-option"
                  :class="{ active: currentSettings.color.name === color.name }"
                  @click="updateColor(color)"
                >
                  <div
                    class="color-preview"
                    :style="{ backgroundColor: color.primary }"
                  ></div>
                  <span class="color-name">{{ color.displayName }}</span>
                </div>

                <!-- 自定义颜色选项 -->
                <div
                  class="color-option custom-color-option"
                  :class="{ active: currentSettings.color.name === 'custom' }"
                  @click="showCustomColorPicker"
                >
                  <div class="color-preview custom-color-preview">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.36 4.24-1.01L12 16.5l-6-6V8c0-.55.45-1 1-1h4c.55 0 1-.45 1-1s-.45-1-1-1H7c-1.66 0-3 1.34-3 3v2.5l6 6 4.24 5.49C18.64 20.5 22 16.64 22 12c0-5.52-4.48-10-10-10zm5 11h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H9c-.55 0-1-.45-1-1s.45-1 1-1h3V8c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1z"
                      />
                    </svg>
                  </div>
                  <span class="color-name">自定义</span>
                </div>
              </div>

              <!-- 自定义颜色输入区域 -->
              <div v-if="showingCustomColor" class="custom-color-section">
                <div class="custom-color-inputs">
                  <div class="color-input-group">
                    <label>主色</label>
                    <div class="color-input-wrapper">
                      <input
                        type="color"
                        v-model="customColors.primary"
                        @input="updateCustomColor"
                        class="color-picker"
                      />
                      <input
                        type="text"
                        v-model="customColors.primary"
                        @input="updateCustomColor"
                        class="color-text-input"
                        placeholder="#FF8C59"
                      />
                    </div>
                  </div>
                  <div class="color-input-group">
                    <label>辅色</label>
                    <div class="color-input-wrapper">
                      <input
                        type="color"
                        v-model="customColors.secondary"
                        @input="updateCustomColor"
                        class="color-picker"
                      />
                      <input
                        type="text"
                        v-model="customColors.secondary"
                        @input="updateCustomColor"
                        class="color-text-input"
                        placeholder="#FFA573"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 圆角设置 -->
            <div class="setting-section">
              <h4 class="setting-title">圆角风格</h4>

              <!-- 预设圆角选项 -->
              <div class="radius-presets">
                <div
                  v-for="radius in radiusPresets"
                  :key="radius.name"
                  class="radius-preset"
                  :class="{
                    active: currentSettings.borderRadius.name === radius.name,
                  }"
                  @click="updateBorderRadius(radius)"
                >
                  <div
                    class="radius-preview"
                    :style="{ borderRadius: radius.value }"
                  ></div>
                  <span class="radius-label">{{ radius.label }}</span>
                </div>
              </div>

              <!-- 自定义圆角滑动条 -->
              <div class="custom-radius-section">
                <div class="slider-group">
                  <div class="slider-header">
                    <label>自定义圆角</label>
                    <span class="slider-value">{{ customBorderRadius }}px</span>
                  </div>
                  <div class="slider-wrapper">
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      v-model="customBorderRadius"
                      @input="updateCustomBorderRadius"
                      class="radius-slider"
                    />
                    <div
                      class="slider-preview"
                      :style="{ borderRadius: customBorderRadius + 'px' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 字体设置 -->
            <div class="setting-section">
              <h4 class="setting-title">字体配置</h4>

              <!-- 字体族选择 -->
              <div class="font-family-section">
                <h5 class="subsection-title">字体族</h5>
                <div class="font-options">
                  <div
                    v-for="font in fontOptions"
                    :key="font.name"
                    class="font-option"
                    :class="{ active: currentSettings.font.name === font.name }"
                    @click="updateFont(font)"
                  >
                    <div
                      class="font-preview"
                      :style="{ fontFamily: font.preview }"
                    >
                      {{ font.sampleText }}
                    </div>
                    <div class="font-info">
                      <span class="font-name">{{ font.displayName }}</span>
                      <span class="font-desc">{{ font.description }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 字体大小调节 -->
              <div class="font-size-section">
                <h5 class="subsection-title">字体大小</h5>
                <div class="slider-group">
                  <div class="slider-header">
                    <label>基础字体大小</label>
                    <span class="slider-value">{{ fontSize }}px</span>
                  </div>
                  <div class="slider-wrapper">
                    <input
                      type="range"
                      min="14"
                      max="20"
                      step="1"
                      v-model="fontSize"
                      @input="updateFontSize"
                      class="font-size-slider"
                    />
                    <div
                      class="font-preview-text"
                      :style="{ fontSize: fontSize + 'px' }"
                    >
                      示例文本 Sample Text
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 重置设置 -->
            <div class="setting-section">
              <div class="reset-section">
                <button @click="resetToDefaults" class="reset-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"
                    />
                  </svg>
                  重置为默认设置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

// 响应式状态
const isModalOpen = ref(false);
const showingCustomColor = ref(false);
const customBorderRadius = ref(8);
const fontSize = ref(16);

// 自定义颜色
const customColors = ref({
  primary: "#FF8C59",
  secondary: "#FFA573",
});

// 当前设置状态
const currentSettings = ref({
  appearance: "auto",
  color: {
    name: "orange",
    displayName: "经典橙",
    primary: "#FF8C59",
    secondary: "#FFA573",
    tertiary: "#FFBE8D",
  },
  borderRadius: {
    name: "medium",
    label: "中等",
    value: "8px",
  },
  font: {
    name: "default",
    displayName: "默认字体",
    preview: "Inter, sans-serif",
  },
  fontSize: 16,
});

// 外观模式选项
const appearanceModes = [
  {
    name: "light",
    label: "浅色",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>',
  },
  {
    name: "dark",
    label: "深色",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M11.01 3.05C6.51 3.54 3 7.36 3 12a9 9 0 0 0 9 9c4.63 0 8.45-3.5 8.95-8 .09-.79-.78-1.42-1.54-.95-.84.52-1.84.95-2.95.95-3.18 0-5.75-2.54-5.75-5.7 0-1.1.38-2.1.94-2.9.47-.67-.15-1.63-.94-1.35z"/></svg>',
  },
  {
    name: "auto",
    label: "自动",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
  },
];

// 预设颜色选项
const colorOptions = [
  {
    name: "orange",
    displayName: "经典橙",
    primary: "#FF8C59",
    secondary: "#FFA573",
    tertiary: "#FFBE8D",
  },
  {
    name: "blue",
    displayName: "蓝色",
    primary: "#4F9CF9",
    secondary: "#7BB3FA",
    tertiary: "#A8C9FC",
  },
  {
    name: "green",
    displayName: "自然绿",
    primary: "#22C55E",
    secondary: "#4ADE80",
    tertiary: "#86EFAC",
  },
  {
    name: "purple",
    displayName: "优雅紫",
    primary: "#8B5CF6",
    secondary: "#A78BFA",
    tertiary: "#C4B5FD",
  },
  {
    name: "red",
    displayName: "热情红",
    primary: "#EF4444",
    secondary: "#F87171",
    tertiary: "#FCA5A5",
  },
  {
    name: "teal",
    displayName: "青色",
    primary: "#14B8A6",
    secondary: "#5EEAD4",
    tertiary: "#99F6E4",
  },
];

// 预设圆角选项
const radiusPresets = [
  { name: "none", label: "无圆角", value: "0px" },
  { name: "small", label: "小圆角", value: "4px" },
  { name: "medium", label: "中等", value: "8px" },
  { name: "large", label: "大圆角", value: "12px" },
  { name: "xl", label: "超大", value: "16px" },
];

// 字体选项
const fontOptions = [
  {
    name: "default",
    displayName: "默认字体",
    description: "Inter + Poppins 现代组合",
    preview: "Inter, Poppins, sans-serif",
    sampleText: "Aa 你好",
  },
  {
    name: "system",
    displayName: "系统字体",
    description: "系统默认无衬线字体",
    preview: '-apple-system, "Segoe UI", sans-serif',
    sampleText: "Aa 你好",
  },
  {
    name: "elegant",
    displayName: "优雅衬线",
    description: "Georgia + Times 经典优雅",
    preview: 'Georgia, "Times New Roman", serif',
    sampleText: "Aa 你好",
  },
  {
    name: "modern",
    displayName: "现代简约",
    description: "Poppins + Helvetica 现代简洁",
    preview: 'Poppins, "Helvetica Neue", sans-serif',
    sampleText: "Aa 你好",
  },
];

// 方法
const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
};

const closeModal = () => {
  isModalOpen.value = false;
  showingCustomColor.value = false;
};

// 显示自定义颜色选择器
const showCustomColorPicker = () => {
  showingCustomColor.value = !showingCustomColor.value;
  if (showingCustomColor.value) {
    currentSettings.value.color = {
      name: "custom",
      displayName: "自定义",
      primary: customColors.value.primary,
      secondary: customColors.value.secondary,
      tertiary: customColors.value.secondary,
    };
    applyColor(currentSettings.value.color);
    saveSettings();
  }
};

// 更新自定义颜色
const updateCustomColor = () => {
  if (currentSettings.value.color.name === "custom") {
    currentSettings.value.color = {
      name: "custom",
      displayName: "自定义",
      primary: customColors.value.primary,
      secondary: customColors.value.secondary,
      tertiary: customColors.value.secondary,
    };
    applyColor(currentSettings.value.color);
    saveSettings();
  }
};

// 更新自定义圆角
const updateCustomBorderRadius = () => {
  const radius = {
    name: "custom",
    label: "自定义",
    value: customBorderRadius.value + "px",
  };
  currentSettings.value.borderRadius = radius;
  applyBorderRadius(radius);
  saveSettings();
};

// 更新字体大小
const updateFontSize = () => {
  currentSettings.value.fontSize = Number(fontSize.value);
  applyFontSize(currentSettings.value.fontSize);
  saveSettings();
};

// 更新外观模式
const updateAppearance = (mode: string) => {
  currentSettings.value.appearance = mode;
  applyAppearance(mode);
  saveSettings();
};

// 更新颜色
const updateColor = (color: any) => {
  currentSettings.value.color = color;
  showingCustomColor.value = false;
  applyColor(color);
  saveSettings();
};

// 更新圆角
const updateBorderRadius = (radius: any) => {
  currentSettings.value.borderRadius = radius;
  customBorderRadius.value = parseInt(radius.value);
  applyBorderRadius(radius);
  saveSettings();
};

// 更新字体
const updateFont = (font: any) => {
  currentSettings.value.font = font;
  applyFont(font);
  saveSettings();
};

// 重置为默认设置
const resetToDefaults = () => {
  currentSettings.value = {
    appearance: "auto",
    color: {
      name: "orange",
      displayName: "经典橙",
      primary: "#FF8C59",
      secondary: "#FFA573",
      tertiary: "#FFBE8D",
    },
    borderRadius: {
      name: "medium",
      label: "中等",
      value: "8px",
    },
    font: {
      name: "default",
      displayName: "默认字体",
      preview: "Inter, sans-serif",
    },
    fontSize: 16,
  };

  customBorderRadius.value = 8;
  fontSize.value = 16;
  showingCustomColor.value = false;

  applyAppearance(currentSettings.value.appearance);
  applyColor(currentSettings.value.color);
  applyBorderRadius(currentSettings.value.borderRadius);
  applyFont(currentSettings.value.font);
  applyFontSize(currentSettings.value.fontSize);
  saveSettings();
};

// 应用外观模式
const applyAppearance = (mode: string) => {
  const html = document.documentElement;

  if (mode === "light") {
    html.classList.remove("dark");
  } else if (mode === "dark") {
    html.classList.add("dark");
  } else {
    // auto mode - 跟随系统
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }
};

// 应用颜色主题
const applyColor = (color: any) => {
  const root = document.documentElement;

  root.style.setProperty("--theme-primary", color.primary);
  root.style.setProperty("--theme-secondary", color.secondary);
  root.style.setProperty("--theme-tertiary", color.tertiary);
  root.style.setProperty("--theme-selection-bg", color.primary);

  // 设置rainbow动画主题
  root.setAttribute("data-theme", color.name);
};

// 应用圆角设置
const applyBorderRadius = (radius: any) => {
  const root = document.documentElement;
  root.style.setProperty("--theme-border-radius", radius.value);
};

// 应用字体设置
const applyFont = (font: any) => {
  const root = document.documentElement;
  root.setAttribute("data-font", font.name);
};

// 应用字体大小
const applyFontSize = (size: number) => {
  const root = document.documentElement;
  root.style.setProperty("--vp-font-size-root", size + "px");
};

// 保存设置
const saveSettings = () => {
  try {
    const settingsToSave = {
      ...currentSettings.value,
      customBorderRadius: customBorderRadius.value,
      customColors: customColors.value,
    };
    localStorage.setItem(
      "cellstack-theme-settings",
      JSON.stringify(settingsToSave)
    );
  } catch (e) {
    console.warn("无法保存主题设置:", e);
  }
};

// 加载设置
const loadSettings = () => {
  try {
    const saved = localStorage.getItem("cellstack-theme-settings");
    if (saved) {
      const settings = JSON.parse(saved);
      currentSettings.value = { ...currentSettings.value, ...settings };

      if (settings.customBorderRadius) {
        customBorderRadius.value = settings.customBorderRadius;
      }
      if (settings.customColors) {
        customColors.value = {
          ...customColors.value,
          ...settings.customColors,
        };
      }
      if (settings.fontSize) {
        fontSize.value = settings.fontSize;
      }

      return currentSettings.value;
    }
  } catch (e) {
    console.warn("无法读取主题设置:", e);
  }
  return currentSettings.value;
};

// ESC键关闭弹窗
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isModalOpen.value) {
    closeModal();
  }
};

// 监听系统主题变化
const handleSystemThemeChange = () => {
  if (currentSettings.value.appearance === "auto") {
    applyAppearance("auto");
  }
};

// 初始化
onMounted(() => {
  // 加载保存的设置
  const settings = loadSettings();

  // 应用设置
  nextTick(() => {
    applyAppearance(settings.appearance);
    applyColor(settings.color);
    applyBorderRadius(settings.borderRadius);
    applyFont(settings.font);
    applyFontSize(settings.fontSize || 16);
  });

  // 监听按键和系统主题
  document.addEventListener("keydown", handleEscKey);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", handleSystemThemeChange);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscKey);
});
</script>

<style scoped>
.theme-settings-container {
  display: inline-block;
  position: relative;
}

.theme-settings-button {
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
  outline: none;
}

.theme-settings-button:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.theme-settings-button:hover .theme-settings-icon {
  transform: scale(1.05);
}

.current-theme-display {
  display: flex;
  align-items: center;
  gap: 4px;
}

.theme-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--theme-primary);
  box-shadow: 0 0 0 1px var(--vp-c-bg), 0 0 0 2px var(--vp-c-divider);
}

.theme-settings-icon {
  width: 16px;
  height: 16px;
  transition: all 0.25s ease;
}

.theme-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.theme-modal {
  background: var(--vp-c-bg);
  width: 90vw;
  border-radius: var(--border-radius-xl);
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.theme-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  background: var(--vp-c-bg-soft);
}

.theme-modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.theme-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--border-radius-medium);
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.25s ease;
}

.theme-modal-close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  transform: rotate(90deg);
}

.theme-settings-content {
  padding: 28px;
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

.theme-settings-content::-webkit-scrollbar {
  width: 6px;
}

.theme-settings-content::-webkit-scrollbar-track {
  background: transparent;
}

.theme-settings-content::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 3px;
}

.setting-section {
  margin-bottom: 36px;
}

.setting-section:last-child {
  margin-bottom: 0;
}

.setting-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.subsection-title {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

/* 外观模式 - 无边框设计 */
.appearance-options {
  display: flex;
  gap: 12px;
  background: var(--vp-c-bg-soft);
  padding: 8px;
  border-radius: var(--border-radius-large);
}

.appearance-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border: none;
  border-radius: var(--border-radius-medium);
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  flex: 1;
  position: relative;
}

.appearance-option:hover {
  background: var(--vp-c-bg);
}

.appearance-option.active {
  background: var(--vp-c-bg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.appearance-option.active::after {
  content: "";
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--theme-primary);
  border-radius: 1px;
}

.appearance-icon {
  color: var(--vp-c-text-2);
  transition: color 0.25s ease;
}

.appearance-option.active .appearance-icon {
  color: var(--theme-primary);
}

.appearance-label {
  font-size: 14px;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

/* 颜色选择 - 网格布局 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  background: var(--vp-c-bg-soft);
  padding: 20px;
  border-radius: var(--border-radius-large);
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 12px;
  border: none;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition: all 0.25s ease;
  background: transparent;
  position: relative;
}

.color-option:hover {
  background: var(--vp-c-bg);
  transform: translateY(-4px);
}

.color-option.active {
  background: var(--vp-c-bg);
}

.color-option.active::after {
  content: "✓";
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background: var(--theme-primary);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s ease;
}

.color-option:hover .color-preview {
  transform: scale(1.1);
}

.custom-color-preview {
  background: linear-gradient(135deg, #e0e7ff 0%, #fef3c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
}

.color-name {
  font-size: 13px;
  color: var(--vp-c-text-1);
  font-weight: 500;
  text-align: center;
}

/* 自定义颜色输入区域 */
.custom-color-section {
  margin-top: 20px;
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: var(--border-radius-large);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-color-inputs {
  display: flex;
  gap: 20px;
}

.color-input-group {
  flex: 1;
}

.color-input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-picker {
  width: 48px;
  height: 36px;
  border: none;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  background: none;
}

.color-text-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: var(--border-radius-medium);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-family: monospace;
  outline: none;
  transition: all 0.25s ease;
}

.color-text-input:focus {
  background: var(--vp-c-bg-alt);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 圆角预设 */
.radius-presets {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  background: var(--vp-c-bg-soft);
  padding: 16px;
  border-radius: var(--border-radius-large);
  margin-bottom: 20px;
}

.radius-preset {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition: all 0.25s ease;
  flex: 1;
  min-width: 80px;
  background: transparent;
  position: relative;
}

.radius-preset:hover {
  background: var(--vp-c-bg);
}

.radius-preset.active {
  background: var(--vp-c-bg);
}

.radius-preset.active::after {
  content: "";
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: var(--theme-primary);
  border-radius: 1px;
}

.radius-preview {
  width: 36px;
  height: 24px;
  background: var(--theme-primary);
  transition: transform 0.25s ease;
}

.radius-preset:hover .radius-preview {
  transform: scale(1.1);
}

.radius-label {
  font-size: 13px;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

/* 自定义滑动条 */
.custom-radius-section,
.font-size-section {
  background: var(--vp-c-bg-soft);
  padding: 20px;
  border-radius: var(--border-radius-large);
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-header label {
  font-size: 15px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.slider-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-primary);
  font-family: monospace;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.radius-slider,
.font-size-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--vp-c-divider);
  outline: none;
  cursor: pointer;
  appearance: none;
}

.radius-slider::-webkit-slider-thumb,
.font-size-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--theme-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.radius-slider::-webkit-slider-thumb:hover,
.font-size-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider-preview {
  width: 32px;
  height: 20px;
  background: var(--theme-primary);
  transition: border-radius 0.25s ease;
}

.font-preview-text {
  min-width: 120px;
  text-align: center;
  color: var(--vp-c-text-1);
  font-weight: 500;
  transition: font-size 0.25s ease;
}

/* 字体选择 */
.font-family-section {
  margin-bottom: 24px;
}

.font-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--vp-c-bg-soft);
  padding: 16px;
  border-radius: var(--border-radius-large);
}

.font-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: none;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition: all 0.25s ease;
  background: transparent;
  position: relative;
}

.font-option:hover {
  background: var(--vp-c-bg);
  transform: translateY(-1px);
}

.font-option.active {
  background: var(--vp-c-bg);
}

.font-option.active::after {
  content: "";
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: var(--theme-primary);
  border-radius: 50%;
}

.font-preview {
  font-size: 20px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  min-width: 100px;
}

.font-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.font-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.font-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* 重置按钮 */
.reset-section {
  text-align: center;
}

.reset-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-large);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.reset-button:hover {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .theme-modal {
    width: 95vw;
    margin: 0 16px;
  }

  .theme-modal-header {
    padding: 20px 24px;
  }

  .theme-settings-content {
    padding: 24px 20px;
  }

  .appearance-options {
    flex-direction: column;
  }

  .color-grid {
    grid-template-columns: repeat(3, 1fr);
    padding: 16px;
  }

  .custom-color-inputs {
    flex-direction: column;
    gap: 16px;
  }

  .radius-presets {
    justify-content: space-between;
  }

  .radius-preset {
    flex: 0 1 calc(20% - 8px);
    min-width: 60px;
  }

  .font-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .font-preview {
    align-self: center;
  }

  .slider-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
}

/* 暗色模式适配 */
.dark .theme-modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .theme-modal {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.dark .color-preview {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
