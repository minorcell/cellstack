---
title: '服务端渲染（SSR）的新篇章：从 Next.js 看 React Server Components'
description: '从“SSR 不是更快吗？为什么还会卡在 hydration？”这个痛点出发，厘清 SSR/SSG/ISR 的边界，再用 Next.js（App Router）视角讲清 React Server Components（RSC）的核心：组件分工模型改变、减少客户端 JS、支持流式渲染与更自然的数据获取；最后给出实践落地的拆分策略与常见坑'
date: 2025-12-19
order: 13
---

# 服务端渲染（SSR）的新篇章：从 Next.js 看 React Server Components

> 很多人第一次接触 SSR 的心态是：  
> **“服务端先把 HTML 渲染好发给浏览器，那肯定更快、更丝滑吧？”**
>
> 但现实往往是：
>
> - 首屏 HTML 很快就到了
> - 你却仍然点不了、交互没反应
> - 等到一堆 JS 下完、执行完、hydrate 完，页面才“活过来”
>
> 于是你开始困惑：  
> **SSR 到底解决了什么？又没解决什么？RSC 又是来干嘛的？**
>
> 这篇我们用一条主线讲清楚：  
> **SSR 是“提前出 HTML”，而 RSC 是“重新划分组件在哪运行”，目标是减少客户端 JS 与 hydration 压力。**

---

## 0. 先把四个名词放到同一张地图里：SSR / SSG / ISR / RSC

你可以先用一句话记住它们的“主要矛盾”：

- **SSR（Server-Side Rendering）**：请求来了，在服务端现算 HTML
- **SSG（Static Site Generation）**：构建时预生成 HTML，部署后直接读静态文件
- **ISR（Incremental Static Regeneration）**：静态页面可按策略增量再生成（兼顾更新与缓存）
- **RSC（React Server Components）**：不是“渲染模式”，而是**组件执行分工模型**：有些组件只在服务端执行，不打包到客户端

关键点在这里：

> SSR/SSG/ISR 讨论的是“HTML 何时生成”。  
> RSC 讨论的是“组件在哪执行、JS 发不发到浏览器”。

所以 RSC 不是 SSR 的同义词，也不是简单“更强 SSR”。

---

## 1. SSR 的真实价值：更快的首屏内容（但不保证更快可交互）

### 1.1 SSR 解决什么？

- **更快看到内容**：HTML 先到，浏览器能更早 paint
- **更好 SEO**：爬虫能直接拿到内容（注意：现代爬虫对 JS 也越来越强，但 SSR 仍然更稳）
- **更容易做流式输出（Streaming SSR）**：服务端可以边算边吐 HTML，用户更快看到“部分页面”

### 1.2 SSR 没解决什么？（很多人以为 SSR = 立刻可点）

SSR 的 HTML 到了之后，页面要“活”起来还得靠：

- 下载客户端 JS（包含 React runtime + 组件代码）
- 执行 JS，注册事件
- **Hydration（注水）**：把服务端 HTML 与客户端 React 树对齐，绑定事件与状态

这一步如果 JS 体积大、组件多、设备弱，就会出现：

- **内容已显示但不可交互（TTI 慢）**
- **输入/点击延迟**
- **hydrate 期间卡顿**

一句话：

> SSR 加速 FCP（首次内容绘制），但不天然加速 TTI（可交互时间）。

---

## 2. Hydration 到底在干嘛？为什么它会成为瓶颈？

把 hydration 想成一件很“较真”的事：

1. 浏览器拿到 SSR 的 HTML，先画出来（很好）
2. 客户端 JS 运行后，React 要在内存里“重建”一棵组件树
3. React 要确保这棵树与现有 DOM 一致（否则会警告或回退到客户端重渲染）
4. React 逐步给 DOM 节点绑定事件、恢复状态、建立关系

这件事慢的原因很常见：

- **客户端 JS 太大**（下载 + 解析 + 执行）
- **组件树太深太重**（构建与对齐成本高）
- **页面需要大量交互组件**（事件绑定多）
- **低端设备** 上 JS 执行成本被放大

所以很多 SSR 项目“首屏很快但不跟手”，根因往往就是：

> hydration 成本与客户端 JS 成本没有下降。

---

## 3. RSC 的核心动机：让很多组件根本不需要发到客户端

现在进入主角：**React Server Components（RSC）**。

你可以用一句话理解 RSC：

> 把“只负责展示与数据拼装、无需浏览器能力”的组件，留在服务端执行；  
> 只把真正需要交互（事件、状态、浏览器 API）的部分，打包给客户端。

这带来一个直接收益：

- 客户端需要下载/执行的 JS 更少
- hydration 的工作量更小（因为客户端组件更少）

### 3.1 RSC 与 SSR 的关系（最容易混淆的点）

- SSR：把 HTML 提前吐给浏览器（渲染时机）
- RSC：决定哪些组件不进客户端 bundle（执行位置与产物）

在 Next.js（App Router）里经常是组合出现：

- 页面是 SSR/SSG/ISR 之一（决定 HTML 何时生成）
- 同时用 RSC 让大量组件成为 Server Component（减少客户端 JS）

---

## 4. 在 Next.js 里怎么看 RSC？——“默认 Server，遇到交互才 Client”

在 Next.js App Router 的语境下，一个非常重要的默认是：

> **组件默认是 Server Component**，只有标记了 `"use client"` 才是 Client Component。

### 4.1 Server Component 能做什么？

适合做：

- 读取数据库/后端接口（在服务端环境）
- 拼装页面结构（Header、Layout、列表容器）
- 做权限判断（在服务端更安全）
- 处理与密钥相关的逻辑（不暴露给客户端）

特点：

- 不需要把组件 JS 发给浏览器（减少 bundle）
- 产物更多是“可序列化的 UI 描述 + 片段输出”，而不是完整的客户端组件代码

### 4.2 Client Component 负责什么？

只要你需要：

- `useState/useEffect`
- `onClick/onChange` 等事件
- 访问 `window/document`
- 使用依赖浏览器的第三方库（很多 UI/图表/富文本）

你就必须是 Client Component（`"use client"`）。

这也引出一个非常实用的拆分原则：

> **把交互尽量下沉到叶子组件，把大容器与数据获取尽量留在 Server Component。**

---

## 5. “组件分工模型”改变后，你的心智模型要怎么变？

你以前可能习惯这样写：

- 页面组件里 `useEffect` 拉数据
- loading 状态在客户端维护
- 数据到齐后再渲染列表

在 RSC 模型里，更自然的方式是：

- 在 Server Component 里直接 `await` 数据（服务端环境）
- 把数据作为 props 传给 Client 子组件（如果子组件要交互）
- loading 用流式/分段渲染（或 Suspense 边界）来表达

核心变化是：

> **数据获取从“浏览器发起”更多回到“服务端发起”。**  
> 客户端更像是“交互层”，而不是“数据拼装层”。

---

## 6. 典型拆分示例（概念代码）：服务器拿数据，客户端负责交互

假设你有一个商品列表页面：

- 列表展示很多（适合服务端拼装）
- 每行有一个“加入购物车”按钮（需要交互）

你可以拆成：

### 6.1 Server：负责拿数据与拼装结构

```jsx
// Server Component（默认）
export default async function ProductsPage() {
  const products = await fetchProducts() // 服务端拉数据
  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  )
}
```

### 6.2 Client：负责交互

```jsx
'use client'

export function AddToCartButton({ productId }) {
  const [pending, setPending] = React.useState(false)

  return (
    <button
      disabled={pending}
      onClick={async () => {
        setPending(true)
        try {
          await addToCart(productId)
        } finally {
          setPending(false)
        }
      }}
    >
      {pending ? 'Adding...' : 'Add to cart'}
    </button>
  )
}
```

### 6.3 组合：Server 组件渲染 Client 子组件（交互下沉）

```jsx
export function ProductList({ products }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <div>{p.name}</div>
          <AddToCartButton productId={p.id} />
        </li>
      ))}
    </ul>
  )
}
```

这套结构的直观收益：

- `ProductsPage` 和 `ProductList` 不需要打包进客户端（在可行的前提下）
- 客户端只需要 `AddToCartButton` 的 JS
- hydration 面积显著缩小

---

## 7. RSC 的常见“坑点”与边界（必须提前知道）

### 7.1 不是所有第三方库都能直接放 Server

很多库假设浏览器环境（window/document），只能在 Client 用。
因此你可能会看到：

- “这个包只能在客户端使用”的报错
- 或构建时提示不支持某些 API

应对思路：

- 把依赖这些库的部分下沉到 `"use client"` 组件里
- Server 组件只做数据与结构

### 7.2 序列化边界：Server -> Client 的 props 需要可序列化

你不能把：

- 函数
- class 实例
- 含循环引用的对象
  随便从 Server 传给 Client。

应对思路：

- 传纯数据（JSON 形态）
- 或传 ID，让客户端再做局部请求/动作

### 7.3 “全量 Client 化”会抵消 RSC 的收益

如果你在顶层写了 `"use client"`，那么它的所有子组件都会变成客户端树的一部分（在很多情况下意味着更大 bundle）。
这会让你回到“SSR + 大 hydration”的老问题。

原则再强调一次：

> 交互下沉，容器上浮到 Server。

---

## 8. SSR + RSC 的最佳实践：用“分段渲染”改善体验

当页面里有不同耗时的数据块：

- 用户信息很快
- 推荐列表很慢
- 评论区更慢

你不应该让“最慢的一块”拖住整个页面。

更好的体验是：

- 先把骨架与快数据流式输出
- 慢数据块用边界包起来，晚点再流式补齐
- 客户端交互组件只在需要处 hydrate

你可以把它理解为：

> 把“首屏体验”拆成多个可独立完成的块，而不是一次性全成全败。

---

## 9. 选型与落地：什么时候值得上 RSC 思路？

你可以用一个非常实用的判断：

### 更适合 RSC/Server-first 的场景

- 内容型页面、列表型页面居多（交互占比不高）
- 强依赖数据读取与权限判断
- 希望减少客户端 JS（移动端/弱网/低端设备友好）
- 页面结构复杂但交互点集中在少量组件

### Client-heavy 的场景需要谨慎

- 大量富交互（编辑器、画布、拖拽、复杂图表）
- 几乎每个区域都有状态与事件
  这类场景 RSC 依然能用，但收益可能没有想象中大，拆分成本更高。

---

## 10. 本文小结：把“模式”看清，比记名词更重要

你需要带走的不是一堆缩写，而是一套判断框架：

1. SSR/SSG/ISR 决定：**HTML 什么时候生成**
2. Hydration 决定：**页面什么时候能交互**（JS 体积与树规模是关键）
3. RSC 决定：**哪些组件根本不需要发到客户端**（减少 JS 与 hydration 压力）
4. 在 Next.js 里：默认 Server，遇到交互才 `"use client"`
5. 拆分原则：**交互下沉、容器上浮、数据在服务端、UI 分段流式**
