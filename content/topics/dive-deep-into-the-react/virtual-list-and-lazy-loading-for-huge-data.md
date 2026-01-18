---
title: '海量数据的挑战：虚拟列表与按需加载的实现'
description: '从“渲染 1 万行列表必卡、滚动掉帧、首屏白屏”这些硬性能问题出发，讲清虚拟列表的核心原理：只渲染可视区域、用占位撑开滚动高度、把 scrollTop 映射到起止索引；并深入动态高度、滚动锚点、预加载与按需加载的工程细节，最后给出一个可直接落地的 React 实现骨架'
date: 2025-12-17
order: 12
---

> 当你第一次把“几百条数据”升级成“一万条数据”，你会很快意识到：  
> **这不是 React 慢，而是浏览器不允许你这样干。**
>
> 常见症状非常统一：
>
> - 首屏要等很久（甚至白屏）
> - 滚动时明显掉帧
> - 输入、点击、切换 Tab 都变得迟钝
>
> 原因也很直白：你让浏览器同时维护了成千上万个 DOM 节点（布局、绘制、命中测试都很贵）。  
> React 再怎么优化 diff，也救不了“DOM 本身就扛不住”的现实。
>
> 这篇我们把虚拟列表（Virtual List / Windowing）讲透，并给出一套可落地的实现框架：
>
> - 固定高度如何做（最简单也最常用）
> - 动态高度怎么处理（最容易踩坑）
> - 按需加载如何与虚拟列表协同（无限滚动）
> - 以及你在工程里必须处理的“滚动锚点”“预渲染 buffer”“稳定 key”等细节

---

## 0. 先建立共识：大列表的瓶颈不在 diff，而在 DOM 与布局

渲染 1 万行意味着：

- 1 万个节点参与 layout（布局）
- 1 万个节点参与 paint（绘制）
- 滚动时浏览器要不断做命中测试与合成
- React 更新时还要走一遍组件计算

即使 React 做到了“最小 DOM 变更”，你依然在维持 1 万个 DOM——这才是根本问题。

虚拟列表的思路非常朴素：

> **用户屏幕一次只能看到几十行，那我就只渲染几十行。**

---

## 1. 虚拟列表的核心思想：窗口化（Windowing）

把“全部数据”当成一个很长的卷轴，但实际上：

- DOM 里只放可视区域附近的一小段（window）
- 其他部分用“空白占位”撑开高度，让滚动条长度正确

你可以把虚拟列表分成三件事：

1. **计算**：根据 `scrollTop` 算出应该渲染的起止索引
2. **占位**：用一个总高度的容器撑开滚动空间
3. **定位**：把实际渲染的那一段内容 `translateY` 到正确位置

---

## 2. 固定高度虚拟列表：最简单、最稳、覆盖 80% 场景

### 2.1 基本参数

- `itemHeight`：每行固定高度
- `viewportHeight`：容器高度
- `scrollTop`：当前滚动位置
- `overscan`：上下多渲染几行（缓冲区，减少滚动抖动）

### 2.2 关键公式（建议你记住）

- `startIndex = floor(scrollTop / itemHeight)`
- `visibleCount = ceil(viewportHeight / itemHeight)`
- `endIndex = startIndex + visibleCount - 1`
- 加 buffer：
  - `startIndex = max(0, startIndex - overscan)`
  - `endIndex = min(total - 1, endIndex + overscan)`
- 总占位高度：
  - `totalHeight = total * itemHeight`
- 内容偏移：
  - `offsetY = startIndex * itemHeight`

这样你就能只渲染 `items[startIndex..endIndex]` 这一小段。

---

## 3. 一个可落地的 React 实现骨架（固定高度）

下面是一份“能用”的实现骨架（偏教学可读性，工程可再抽象）：

```jsx
function VirtualList({
  items,
  height,
  itemHeight,
  overscan = 5,
  renderItem,
  getKey,
}) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const total = items.length
  const totalHeight = total * itemHeight

  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(height / itemHeight) + overscan * 2
  const end = Math.min(total - 1, start + visibleCount - 1)

  const offsetY = start * itemHeight
  const visibleItems = items.slice(start, end + 1)

  return (
    <div
      style={{ height, overflow: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => {
            const index = start + i
            return (
              <div key={getKey(item, index)} style={{ height: itemHeight }}>
                {renderItem(item, index)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

### 3.1 工程建议（你一上线就会用到）

- `getKey`：务必使用稳定 ID（不要用 index 作为业务 key，除非列表永不变序）
- `renderItem`：尽量让 Row 组件 `React.memo`，并传稳定 props，减少窗口内的无效重渲染
- overscan：一般 3~10 行，根据行高与滚动速度调

---

## 4. 动态高度列表：真正难的部分（不要一上来就做）

固定高度很好，但现实是：

- 文本多就高
- 图片加载后高度变化
- 展开/折叠会改高度

动态高度的难点是：

> `scrollTop -> startIndex` 的映射不再是线性的除法。
> 你需要知道每一项的累计高度（prefix sum）。

### 4.1 两种主流策略

#### 策略 A：近似 + 修正（工程上最常见）

- 先用一个“预估高度”做粗算
- 渲染后测量真实高度（ResizeObserver 或 ref 测量）
- 更新高度缓存与累计偏移
- 发现偏差后做滚动位置修正（避免跳动）

优点：

- 性能更好
- 实现相对可控
  缺点：
- 需要处理“测量带来的抖动与修正”

#### 策略 B：维护高度映射 + 二分查找

- 维护每项高度与前缀和数组 `prefix[i]`
- 根据 `scrollTop` 在 prefix 里二分找 startIndex
- 渲染 window
- 高度变化时更新 prefix（可能是局部更新，也可能整体重算）

优点：

- 理论更严谨
  缺点：
- 维护 prefix 的成本高
- 高度频繁变化时更新开销大

### 4.2 动态高度最常见的“跳动”问题：滚动锚点（scroll anchor）

你会遇到这个现象：

- 正在看第 200 条附近
- 上面某条图片加载完成，高度变大
- 你的视口内容突然往下“跳了一截”

用户体验非常差。

本质原因：

- DOM 的真实高度变了
- `scrollTop` 没变，但它对应的内容位置变了

解决思路（概念）：

- 记录“锚点元素”（视口顶部的 item 与其偏移）
- 当高度变化导致布局变化时，调整 scrollTop 使锚点保持在原位置

这也是为什么很多成熟库对动态高度投入很大：它真的不好做。

---

## 5. 按需加载（Infinite Loading）：虚拟列表的“搭档”

当数据量大到根本不该一次拿全时，通常会：

- 后端分页
- 前端滚动到底触发 `loadMore`
- 逐段拼接列表

### 5.1 触发时机：不要等滚到底才请求

经验做法是设置阈值（prefetch threshold）：

- 当 `endIndex` 接近 `items.length - 1 - threshold` 时就开始加载
- threshold 可用“屏幕高度的 1~2 倍”换算成行数

这样能避免用户滚到最底部才发现还在 loading。

### 5.2 加载状态如何渲染？

常见做法：

- 在列表末尾追加一个 “loading row”
- 或者用 skeleton 行占位

注意：loading row 也要纳入虚拟列表的 item 体系（总数/高度/索引）。

---

## 6. 性能细节：虚拟列表做了，但还是卡？你多半踩了这些点

### 6.1 Row 内部太重（窗口虽小，但每行很贵）

解决：

- Row 组件 `React.memo`
- props 尽量原子化，避免每次传新对象/新函数
- 能懒加载的内容（图片、富文本）尽量延迟

### 6.2 滚动事件触发 setState 过频

滚动是高频事件，直接 setState 可能导致频繁 render。

工程常用策略：

- 用 `requestAnimationFrame` 合并滚动更新（一帧一次）
- 或节流（throttle）

### 6.3 过小的 overscan 导致“白边/闪烁”

overscan 太小，滚动快时窗口来不及补上，可能看到空白。

解决：

- 增大 overscan
- 或根据滚动速度动态调整 overscan（高级玩法）

### 6.4 key 不稳定导致 DOM 复用错位

虚拟列表因为会频繁 mount/unmount 行，如果 key 不稳定，会更容易出现：

- 输入框串台
- 动画错位
- 行状态混乱

务必使用稳定 key（id）。

---

## 7. 虚拟列表与 React 优化工具怎么协同？

把前几篇串起来：

- Diff（key）：保证行身份稳定、复用正确
- memo/useMemo/useCallback：降低窗口内重渲染成本
- batching：滚动/加载触发的多次 setState 尽量合并
- Fiber/time slicing：大计算被拆分，但 DOM 过多仍然会卡，所以虚拟列表依然必要

结论：

> 虚拟列表解决的是“DOM 规模”，memo 解决的是“单行成本”，两者是乘法关系。

---

## 8. 本文小结：你需要掌握的“虚拟列表四件套”

1. 只渲染可视窗口（start/end）+ overscan 缓冲
2. 用总高度占位撑开滚动条，用 translateY 定位窗口内容
3. 固定高度最稳；动态高度要面对测量与滚动锚点修正
4. 按需加载提前触发，loading row 也要纳入虚拟化体系
