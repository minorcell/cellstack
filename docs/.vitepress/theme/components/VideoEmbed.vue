<template>
  <div class="video-embed-container" v-if="embedUrl">
    <div class="video-embed-wrapper">
      <iframe
        :src="embedUrl"
        :title="title || 'Video Player'"
        frameborder="0"
        scrolling="no"
        allowfullscreen
        :allow="allowPermissions"
        :referrerpolicy="referrerPolicy"
        class="video-embed-iframe"
      ></iframe>
    </div>
  </div>
  <div v-if="title" class="video-title">
    {{ title }}
  </div>
  <div v-else class="video-embed-error">
    <div class="error-content">
      <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        />
      </svg>
      <p class="error-message">不支持的视频链接格式</p>
      <p class="error-hint">当前支持: Bilibili、YouTube</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  width: {
    type: [String, Number],
    default: "100%",
  },
  height: {
    type: [String, Number],
    default: 315,
  },
  aspectRatio: {
    type: String,
    default: "16:9",
  },
  showPlatformIcon: {
    type: Boolean,
    default: true,
  },
});

// 解析不同平台的视频ID和生成embed链接
const videoInfo = computed(() => {
  const url = props.url.trim();

  // Bilibili 支持多种格式
  if (url.includes("bilibili.com")) {
    // 从路径中提取BV号或AV号
    const bvPathMatch = url.match(/\/video\/(BV[a-zA-Z0-9]+)/);
    const avPathMatch = url.match(/\/video\/av(\d+)/);

    // 从URL参数中提取其他参数
    const bvParamMatch = url.match(/[?&]bvid=([^&]+)/);
    const aidParamMatch = url.match(/[?&]aid=([^&]+)/);
    const cidMatch = url.match(/[?&]cid=([^&]+)/);
    const pageMatch = url.match(/[?&]p=([^&]+)/);

    const bvid = bvPathMatch?.[1] || bvParamMatch?.[1];
    const aid = avPathMatch?.[1] || aidParamMatch?.[1];

    if (bvid || aid) {
      let embedUrl = "//player.bilibili.com/player.html?isOutside=true";

      if (aid) embedUrl += `&aid=${aid}`;
      if (bvid) embedUrl += `&bvid=${bvid}`;
      if (cidMatch) embedUrl += `&cid=${cidMatch[1]}`;
      if (pageMatch) embedUrl += `&p=${pageMatch[1]}`;
      else embedUrl += "&p=1";

      return {
        platform: "bilibili",
        embedUrl,
        allowPermissions:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        referrerPolicy: "strict-origin-when-cross-origin",
      };
    }

    // 处理直接的iframe embed代码
    if (url.includes("player.bilibili.com")) {
      const srcMatch = url.match(/src="([^"]+)"/);
      if (srcMatch) {
        return {
          platform: "bilibili",
          embedUrl: srcMatch[1],
          allowPermissions:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          referrerPolicy: "strict-origin-when-cross-origin",
        };
      }
    }
  }

  // YouTube 支持多种格式
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";

    // 提取视频ID的不同方式
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }

    if (videoId) {
      // 提取时间参数
      const timeMatch = url.match(/[?&]t=([^&]+)/);
      let embedUrl = `https://www.youtube.com/embed/${videoId}`;

      if (timeMatch) {
        embedUrl += `?start=${timeMatch[1]}`;
      }

      return {
        platform: "youtube",
        embedUrl,
        allowPermissions:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        referrerPolicy: "strict-origin-when-cross-origin",
      };
    }
  }

  // 其他平台可以在这里扩展
  // 如: 优酷、爱奇艺、腾讯视频等

  return null;
});

const embedUrl = computed(() => videoInfo.value?.embedUrl);
const platform = computed(() => videoInfo.value?.platform);
const allowPermissions = computed(
  () => videoInfo.value?.allowPermissions || ""
);
const referrerPolicy = computed(
  () => videoInfo.value?.referrerPolicy || "strict-origin-when-cross-origin"
);

// 计算宽高比
const aspectRatioStyle = computed(() => {
  const [width, height] = props.aspectRatio.split(":").map(Number);
  const paddingTop = (height / width) * 100;
  return `${paddingTop}%`;
});
</script>

<style scoped>
.video-embed-container {
  margin: 1.5rem 0;
  margin-bottom: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
}

.video-embed-container:hover {
  box-shadow: 0 4px 12px var(--vp-c-shadow-2);
}

.video-embed-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: v-bind(aspectRatioStyle);
  background: #000;
}

.video-embed-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-title {
  color: var(--vp-c-text-1);
  margin-bottom: 1rem;
  text-align: center;
  font-size: 12px;
  font-style: italic;
  opacity: 0.6;
}

.video-platform-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.platform-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
  color: white;
}

.platform-icon.platform-bilibili {
  background: #fb7299;
}

.platform-icon.platform-youtube {
  background: #ff0000;
}

.platform-text {
  font-weight: 500;
}

.video-embed-error {
  margin: 1.5rem 0;
  padding: 2rem;
  text-align: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-warning-soft);
  border-radius: 8px;
}

.error-content {
  max-width: 300px;
  margin: 0 auto;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--vp-c-warning);
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.error-hint {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-embed-container {
    margin: 1rem 0;
    border-radius: 6px;
  }

  .video-platform-badge {
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem;
  }

  .platform-icon {
    width: 18px;
    height: 18px;
    font-size: 11px;
  }
}

/* 暗色模式适配 */
.dark .video-embed-container {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

.dark .video-platform-badge {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

.dark .video-embed-error {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-warning-soft);
}
</style>
