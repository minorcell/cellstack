# VideoEmbed 视频嵌入组件

VideoEmbed 是一个用于嵌入主流视频平台内容的 Vue 组件，支持 Bilibili 和 YouTube 视频嵌入。

组件链接：[minorcell/cellstack](https://github.com/minorcell/cellstack/blob/main/docs/.vitepress/theme/components/VideoEmbed.vue)

::: warning
当前仅支持 Bilibili 和 YouTube 视频平台。
:::

## 使用方法

```vue
<VideoEmbed
  url="视频链接"
  title="视频标题（可选）"
  width="100%"
  height="315"
  aspect-ratio="16:9"
/>
```

## 使用示例

### 基础使用

<VideoEmbed url="https://www.bilibili.com/video/BV1GJ411x7h7" />

```vue
<VideoEmbed url="https://www.bilibili.com/video/BV1GJ411x7h7" />
```

### 自定义尺寸

<VideoEmbed
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  width="800"
  height="450"
/>

```vue
<VideoEmbed
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  width="800"
  height="450"
/>
```

### 设置标题

标题一般用于描述视频内容，如视频标题。

<VideoEmbed
  url="https://www.bilibili.com/video/BV1GJ411x7h7"
  title="【官方 MV】Never Gonna Give You Up - Rick Astley"
/>

```vue
<VideoEmbed
  url="https://www.bilibili.com/video/BV1GJ411x7h7"
  title="【官方 MV】Never Gonna Give You Up - Rick Astley"
/>
```

## 参数说明

| 参数         | 类型          | 必填 | 默认值 | 说明                               |
| ------------ | ------------- | ---- | ------ | ---------------------------------- |
| url          | String        | 是   | -      | 视频平台链接，在视频平台分享时获取 |
| title        | String        | 否   | ""     | 视频标题                           |
| width        | String/Number | 否   | "100%" | 播放器宽度                         |
| height       | String/Number | 否   | 315    | 播放器高度                         |
| aspect-ratio | String        | 否   | "16:9" | 宽高比                             |
