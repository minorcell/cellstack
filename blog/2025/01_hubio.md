# Hub-IO：输入 URL 获取 GitHub 贡献者信息，README 从此自带开发者画廊 🎨

## 📖 故事要从一个凌晨三点的 Commit 说起...

去年在开发开源项目[Perfedge](https://github.com/minorcell/perfedge)时，我盯着空荡荡的 README 发愁——如何优雅地展示项目贡献者？手动维护头像列表既低效又容易遗漏，直到灵光一闪：**为什么不让 GitHub API 自动生成这个模块？**

下图是笔者当时在[Perfedge](https://perfedge.vercel.app/docs)中实现的效果：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/5424c858436440afb7a1fa306eca98ea~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754618667&x-orig-sign=FFRuVHFsa1dwiLAwKA%2FIbZB7ZdI%3D)

于此，我想既然我有这个需求，是不是别人也有这个需求？尤其是对于开源爱好者来说。恰逢年末，实习的公司也正好放假了，在家没有什么事可以做的，突然就想起来这个：做个网页吧，让大家都可以简便的获取 github 开源仓库贡献者信息。这就是[HUB-IO](https://github.com/minorcell/hub-io)诞生的背景，经过小半天的编码，这个工具已经可以帮助开发者：

1.  🌐 输入仓库 URL 自动获取贡献者信息
2.  🖼️ 生成高清头像拼图
3.  📋 导出结构化 JSON 数据

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/131fe4021f5d4df1850b75d8362c3f64~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754618667&x-orig-sign=1kXNhxFb4Hnx7fQ13Xf15EsG5Q8%3D)

### 1. Canvas 动态画布

导出贡献者头像图是这个项目的最基础功能。输入仓库`URL`，点击`Query`按钮就可以查询生成了，再点击`Export Image`即可导出图片，就是通过这三步就完成了。

其中最核心的渲染小图到一张大图里面并实现设备的自适应问题，我是通过这个函数实现的（当然这算是技术细节并不是产品内容）：

```typescript
const loadImages = async () => {
  const images = await Promise.all(
    developerInfo.map((dev) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = dev.avatar_url;
        img.onload = () => resolve(img);
      });
    })
  );

  if (canvasRef.current) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgSize = 70;
    const padding = 15;
    const maxCanvasWidth = Math.min(800, window.innerWidth - 40);

    const maxPerRow = Math.floor(maxCanvasWidth / (imgSize + padding));
    const canvasWidth = Math.min(
      maxCanvasWidth,
      maxPerRow * (imgSize + padding) + padding
    );
    const canvasHeight =
      Math.ceil(images.length / maxPerRow) * (imgSize + padding) + padding;

    canvas.width = canvasWidth * 2;
    canvas.height = canvasHeight * 2;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    images.forEach((img, index) => {
      const row = Math.floor(index / maxPerRow);
      const col = index % maxPerRow;

      const x = col * (imgSize + padding) + padding;
      const y = row * (imgSize + padding) + padding;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x * 2 + imgSize, y * 2 + imgSize, imgSize, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, x * 2, y * 2, imgSize * 2, imgSize * 2);

      ctx.restore();
    });

    setImagesLoaded(true);
  }
};
```

图片导出效果（这里用的是 vuejs/vue 团队的示例哈哈哈哈）

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/54712377ab6c4c819569a7943f686fb4~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754618667&x-orig-sign=CxCUna1gen7iv9lPJ0myLv8zr5Q%3D)

![contributors.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/b931946e12e4426f9fd34805263a28aa~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754618667&x-orig-sign=xYASndNk3ZIMsWR3Eh7a6uJLjhM%3D)

### 2. 渐进式数据导出

考虑到另外一种情况，有时候贡献者信息不仅仅是放在 README 文件中，也可能是嵌入再网页中，于是我便扩展了基础功能：支持 JSON 数据格式导出到粘贴板，效果如下。

```json
[
  {
    "avatar_url": "https://avatars.githubusercontent.com/u/499550?v=4",
    "contributions": 2583,
    "login": "yyx990803",
    "html_url": "https://github.com/yyx990803"
  },
  {
    "avatar_url": "https://avatars.githubusercontent.com/u/26507650?v=4",
    "contributions": 113,
    "login": "vue-bot",
    "html_url": "https://github.com/vue-bot"
  },
  {
    "avatar_url": "https://avatars.githubusercontent.com/u/8401776?v=4",
    "contributions": 47,
    "login": "Hanks10100",
    "html_url": "https://github.com/Hanks10100"
  }
  ...
]
```

在页面中的效果如下：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/27d4d8db53c3488a97aa339205f6c1e9~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754618667&x-orig-sign=y7zS1J3wJkOzfIfqMFU%2BFNjkVTk%3D)

## 🛠️ 上手指南

1.  访问[在线演示站](https://hub-io-mcells-projects.vercel.app/)

2.  输入仓库地址（支持`https://`或 `repoOwner/repo`格式）

3.  点击 Query 按钮获取数据

## 🌟 未来路线图

- **支持更多贡献者信息查询**：目前来说处于公共 API 的限制，仅支持最多 30 个贡献者信息导出
- **智能排版引擎**：自动识别最佳布局
- **支持可选数据导出**：目前仅仅预设了四个必须属性，有时候在网页中可能需要展示更多信息

---

**让每一个贡献者都被看见** ✨

立即体验：[hub-io.vercel.app](https://hub-io-mcells-projects.vercel.app/)\
源码仓库：[github.com/minorcell/hub-io](https://github.com/minorcell/hub-io)

欢迎在评论区分享你生成的贡献者画廊！🎉 若觉得项目有用，**别忘了点亮小星星哦\~ ⭐️**
