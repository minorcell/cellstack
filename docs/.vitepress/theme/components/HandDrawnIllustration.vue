<template>
    <div class="hand-drawn-illustration" :class="variant">
        <svg
            :width="width"
            :height="height"
            viewBox="0 0 200 120"
            xmlns="http://www.w3.org/2000/svg"
            class="illustration-svg"
        >
            <defs>
                <!-- 手绘风格滤镜 -->
                <filter
                    id="roughPaper"
                    x="0%"
                    y="0%"
                    width="100%"
                    height="100%"
                >
                    <feTurbulence
                        baseFrequency="0.04"
                        numOctaves="5"
                        result="noise"
                        seed="2"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="1.2"
                    />
                </filter>
            </defs>
            <!-- 手绘风格的抽象图形 -->
            <g v-if="variant === 'abstract'">
                <!-- 主要形状 - 像云朵的抽象形状 -->
                <path
                    d="M20 60 C30 45, 50 45, 70 55 C90 40, 120 50, 140 60 C160 50, 180 65, 170 80 C150 90, 120 85, 100 80 C80 85, 50 80, 30 75 C10 70, 15 60, 20 60 Z"
                    :stroke="primaryColor"
                    :fill="fillColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="hand-drawn-path"
                />

                <!-- 装饰性的小圆点 -->
                <circle
                    cx="45"
                    cy="65"
                    r="3"
                    :fill="accentColor"
                    opacity="0.7"
                />
                <circle
                    cx="85"
                    cy="55"
                    r="2"
                    :fill="accentColor"
                    opacity="0.5"
                />
                <circle
                    cx="125"
                    cy="70"
                    r="2.5"
                    :fill="accentColor"
                    opacity="0.6"
                />

                <!-- 手绘风格的线条 -->
                <path
                    d="M60 35 Q80 25, 100 35 Q120 45, 140 35"
                    stroke="none"
                    :fill="accentColor"
                    opacity="0.3"
                    stroke-width="1.5"
                    stroke-linecap="round"
                />
            </g>

            <!-- 几何风格的装饰 -->
            <g v-else-if="variant === 'geometric'">
                <!-- 手绘风格的三角形 -->
                <path
                    d="M40 80 L60 40 L80 80 Z"
                    :stroke="primaryColor"
                    fill="none"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="hand-drawn-path"
                />

                <!-- 圆形 -->
                <circle
                    cx="120"
                    cy="60"
                    r="20"
                    :stroke="primaryColor"
                    fill="none"
                    stroke-width="2"
                    class="hand-drawn-path"
                />

                <!-- 装饰线条 -->
                <path
                    d="M100 30 Q110 40, 120 30 Q130 20, 140 30"
                    :stroke="accentColor"
                    fill="none"
                    stroke-width="1.5"
                    stroke-linecap="round"
                />

                <!-- 小装饰点 -->
                <circle
                    cx="160"
                    cy="45"
                    r="2"
                    :fill="accentColor"
                    opacity="0.8"
                />
                <circle
                    cx="25"
                    cy="45"
                    r="1.5"
                    :fill="accentColor"
                    opacity="0.6"
                />
            </g>

            <!-- 有机形状风格 -->
            <g v-else-if="variant === 'organic'">
                <!-- 自由形状的叶子或花瓣 -->
                <path
                    d="M50 60 C40 40, 60 30, 80 50 C100 30, 120 40, 110 60 C120 80, 100 90, 80 70 C60 90, 40 80, 50 60 Z"
                    :stroke="primaryColor"
                    :fill="fillColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="hand-drawn-path"
                />

                <!-- 茎干 -->
                <path
                    d="M80 70 Q85 85, 90 100"
                    :stroke="primaryColor"
                    fill="none"
                    stroke-width="2.5"
                    stroke-linecap="round"
                />

                <!-- 小叶子 -->
                <path
                    d="M140 50 C145 45, 155 50, 150 60 C155 70, 145 65, 140 60 Z"
                    :stroke="accentColor"
                    :fill="accentColor"
                    opacity="0.4"
                    stroke-width="1"
                />
            </g>
        </svg>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    variant: {
        type: String,
        default: "abstract",
        validator: (value) =>
            ["abstract", "geometric", "organic"].includes(value),
    },
    width: {
        type: [String, Number],
        default: 200,
    },
    height: {
        type: [String, Number],
        default: 120,
    },
    colorScheme: {
        type: String,
        default: "default",
    },
});

// 颜色配置
const primaryColor = computed(() => {
    const colors = {
        default: "#a0896b",
        warm: "#b8926f",
        cool: "#8b9dc3",
        earth: "#8b7355",
    };
    return colors[props.colorScheme] || colors.default;
});

const accentColor = computed(() => {
    const colors = {
        default: "#d4c4a8",
        warm: "#d4b896",
        cool: "#b5c5e3",
        earth: "#c4b299",
    };
    return colors[props.colorScheme] || colors.default;
});

const fillColor = computed(() => {
    const colors = {
        default: "rgba(160, 137, 107, 0.1)",
        warm: "rgba(184, 146, 111, 0.1)",
        cool: "rgba(139, 157, 195, 0.1)",
        earth: "rgba(139, 115, 85, 0.1)",
    };
    return colors[props.colorScheme] || colors.default;
});
</script>

<style scoped>
.hand-drawn-illustration {
    display: inline-block;
    margin: 1rem 0;
}

.illustration-svg {
    display: block;
    max-width: 100%;
    height: auto;
}

/* 手绘效果的路径动画 */
.hand-drawn-path {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    animation: drawPath 2s ease-in-out forwards;
}

@keyframes drawPath {
    to {
        stroke-dashoffset: 0;
    }
}

/* 轻微的摇摆动画增加手绘感 */
.hand-drawn-illustration:hover .illustration-svg {
    animation: gentleFloat 3s ease-in-out infinite;
}

@keyframes gentleFloat {
    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }
    50% {
        transform: translateY(-2px) rotate(0.5deg);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .hand-drawn-illustration {
        margin: 0.5rem 0;
    }
}
</style>
