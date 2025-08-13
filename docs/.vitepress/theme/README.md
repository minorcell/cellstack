# CellStack 极简主义主题

这是为 CellStack 网站定制的极简主义 VitePress 主题，灵感来源于 Anthropic 的设计理念，追求简洁、现代、人性化的视觉体验。

## 🎨 设计特色

### 极简主义设计
- **大量留白**：增加内容的呼吸空间，提升阅读体验
- **干净版面**：去除冗余装饰，专注内容本身
- **清晰层次**：通过间距和typography建立清晰的信息层次

### 现代感设计
- **无衬线字体**：使用 Inter 和 Poppins 字体组合，类似 Styrene 的现代感
- **简洁线条**：线条分明，边角圆润适中
- **柔和过渡**：所有交互都有平滑的过渡动画

### 人性化元素
- **手绘插图**：使用 Vue 组件实现的 SVG 手绘风格装饰
- **温暖色调**：米色背景 (#faf9f7) 搭配深灰文字 (#2c2c2c)
- **友好交互**：悬停效果温和，避免突兀的视觉跳跃

## 🎯 主要特性

### 颜色系统
```css
/* 浅色模式 */
--vp-c-bg: #faf9f7;        /* 米色背景 */
--vp-c-text-1: #2c2c2c;    /* 深灰文字 */
--vp-c-brand-1: #8b7355;   /* 温暖棕色品牌色 */

/* 深色模式 */
--vp-c-bg: #1a1915;        /* 深色背景 */
--vp-c-text-1: #e8e5e0;    /* 浅色文字 */
--vp-c-brand-1: #d4c4a8;   /* 浅色品牌色 */
```

### 字体系统
- **正文字体**：Inter + Poppins 组合
- **标题字体**：Poppins（增强现代感）
- **代码字体**：JetBrains Mono

### 组件系统
- `HandDrawnIllustration` - 手绘风格装饰组件
- `PageLayout` - 增强页面布局组件

## 🚀 使用方法

### 基础使用

主题会自动应用到所有页面。在 Markdown 文件中可以直接使用：

```markdown
# 标题会自动应用手绘下划线装饰

<HandDrawnIllustration variant="abstract" color-scheme="default" />

<div class="handdrawn-highlight">重要内容高亮</div>

<div class="sketch-border">
手绘风格的边框容器
</div>

<div class="handdrawn-note">
温馨提示内容
</div>
```

### 手绘插图组件

`HandDrawnIllustration` 组件支持多种变体：

```vue
<!-- 抽象风格 -->
<HandDrawnIllustration variant="abstract" color-scheme="default" />

<!-- 几何风格 -->
<HandDrawnIllustration variant="geometric" color-scheme="warm" />

<!-- 有机形状风格 -->
<HandDrawnIllustration variant="organic" color-scheme="earth" />
```

**可用颜色方案：**
- `default` - 默认的温暖棕色
- `warm` - 暖色调
- `cool` - 冷色调  
- `earth` - 大地色调

### CSS 工具类

主题提供了一系列工具类：

```css
.handdrawn-underline     /* 手绘下划线 */
.handdrawn-highlight     /* 手绘高亮标记 */
.handdrawn-note         /* 手绘风格注释框 */
.sketch-border          /* 手绘边框 */
.warm-quote            /* 温暖引用样式 */
.fade-in               /* 淡入动画 */
.article-card          /* 文章卡片样式 */
```

## 📱 响应式设计

主题完全支持响应式设计：

- **桌面端**：最大化利用屏幕空间，内容居中，两侧留白
- **平板端**：适度调整间距和字体大小
- **移动端**：优化触摸交互，隐藏复杂装饰元素

## 🌙 深色模式支持

主题完全支持深色模式，所有颜色都有对应的深色版本，保持一致的视觉体验。

## ⚡ 性能优化

- 使用 CSS 变量实现主题切换
- 最小化 SVG 文件大小
- 优化动画性能
- 支持 `prefers-reduced-motion` 设置

## 🔧 自定义配置

### 修改颜色

在 `custom.css` 中修改 CSS 变量：

```css
:root {
  --vp-c-brand-1: #your-color; /* 修改品牌主色 */
  --vp-c-bg: #your-bg-color;   /* 修改背景色 */
}
```

### 添加新的装饰元素

可以在 `HandDrawnIllustration.vue` 中添加新的 SVG 图形变体。

### 自定义动画

所有动画都使用 CSS 定义，可以在 `custom.css` 中轻松修改或添加新动画。

## 📄 文件结构

```
.vitepress/
├── theme/
│   ├── components/
│   │   ├── HandDrawnIllustration.vue  # 手绘装饰组件
│   │   └── PageLayout.vue             # 页面布局组件
│   ├── custom.css                     # 主题样式
│   ├── index.js                       # 主题入口
│   └── README.md                      # 本说明文档
└── config.js                          # VitePress 配置
```

## 🎯 设计理念

这个主题的设计遵循以下原则：

1. **内容为王**：设计服务于内容，不喧宾夺主
2. **温暖科技**：在冰冷的技术主题中注入人文关怀
3. **持续改进**：根据使用反馈不断优化用户体验
4. **性能优先**：美观的同时保证加载速度和响应性能

## 🔮 未来计划

- [ ] 添加更多手绘装饰元素
- [ ] 支持更多颜色主题
- [ ] 增加页面切换动画
- [ ] 优化移动端体验
- [ ] 添加打印样式优化

---

*让技术文档也有温度，让知识分享更加友好。*