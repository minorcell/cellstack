# MusicEmbed 音乐嵌入组件

MusicEmbed 是一个专为 Spotify 设计的音乐嵌入组件，采用极简设计，仅使用 iframe 实现，无额外装饰。

组件链接：[minorcell/cellstack](https://github.com/minorcell/cellstack/blob/main/docs/.vitepress/theme/components/MusicEmbed.vue)

## 使用方法

```vue
<MusicEmbed url="Spotify链接" width="100%" height="152" />
```

## 示例

<MusicEmbed
  url="https://open.spotify.com/embed/track/6GUq9y0Iy5QrAuPYxTrFp2?utm_source=generator"
  />

```vue
<MusicEmbed
  url="https://open.spotify.com/embed/track/6GUq9y0Iy5QrAuPYxTrFp2?utm_source=generator"
/>
```

## 参数说明

| 参数   | 类型          | 必填 | 默认值 | 说明                                                 |
| ------ | ------------- | ---- | ------ | ---------------------------------------------------- |
| url    | String        | 是   | -      | Spotify 链接，在音乐详情页点击分享按钮，复制链接即可 |
| width  | String/Number | 否   | "100%" | 播放器宽度                                           |
| height | String/Number | 否   | 152    | 播放器高度                                           |
