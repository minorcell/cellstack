<template>
  <iframe
    :src="url"
    frameborder="0"
    scrolling="no"
    allowfullscreen
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    referrerpolicy="strict-origin-when-cross-origin"
    :style="iframeStyle"
    loading="lazy"
  ></iframe>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  width: {
    type: [String, Number],
    default: "100%",
  },
  height: {
    type: [String, Number],
    default: 152,
  },
});

const iframeStyle = computed(() => {
  return {
    width: props.width,
    height: `${props.height}px`,
    borderRadius: "12px",
  };
});
</script>
