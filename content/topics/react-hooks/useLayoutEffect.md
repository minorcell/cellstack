---
title: 'useLayoutEffect'
description: '讲清 useLayoutEffect 的执行时机、与 useEffect 的区别、适用场景与性能陷阱'
date: 2026-01-16
order: 8
---

## 先用一句话理解 useLayoutEffect

`useLayoutEffect` 和 `useEffect` 一样用于副作用，但它会在 **DOM 更新之后、浏览器绘制之前** 同步执行，适合做“必须在首帧绘制前完成”的 DOM 测量与修正。

---

## 它和 useEffect 的核心区别

把一次更新过程粗略分成三段：

- React 计算新 UI（render）
- 把变更提交到 DOM（commit）
- 浏览器把 DOM 绘制到屏幕（paint）

两者区别就在“什么时候执行”：

- `useLayoutEffect`：在 commit 之后、paint 之前执行（同步、会阻塞绘制）
- `useEffect`：在 paint 之后执行（异步感、更不阻塞首帧）

直观感受：

- `useLayoutEffect`：你能在用户看到画面之前把布局“摆正”
- `useEffect`：用户可能先看到一次旧/未修正的画面，然后再更新

---

## 为什么叫 layout

它特别适合和“布局（layout）”相关的工作：

- 测量元素尺寸/位置：`getBoundingClientRect`
- 读取滚动高度、设置滚动位置
- 根据测量结果立刻写回样式，避免闪烁（flicker）
- 首次渲染前聚焦/选中文本（有时也可用 useEffect，但 layout 更“无闪”）

---

## 典型场景：测量后立刻修正位置，避免抖动

比如 tooltip 要贴着按钮显示，你需要先测量按钮位置，再把 tooltip 放到正确位置。

```jsx
function Tooltip({ anchorRef, open }) {
  const tipRef = useRef(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const anchor = anchorRef.current
    const tip = tipRef.current
    if (!anchor || !tip) return

    const a = anchor.getBoundingClientRect()
    const t = tip.getBoundingClientRect()

    setPos({
      left: a.left + (a.width - t.width) / 2,
      top: a.bottom + 8,
    })
  }, [open, anchorRef])

  if (!open) return null

  return (
    <div
      ref={tipRef}
      style={{ position: 'fixed', left: pos.left, top: pos.top }}
    >
      tooltip
    </div>
  )
}
```

如果用 `useEffect`，可能出现：tooltip 先出现在默认位置 → 下一帧才跳到正确位置（闪一下）。

---

## 典型场景：读写 DOM 需要“同一帧完成”

规则可以记成：

- **只读 DOM**：`useEffect` 通常够用
- **读 DOM + 立刻写 DOM**（为了避免闪烁）：优先 `useLayoutEffect`

---

## 不要滥用：它会阻塞绘制

`useLayoutEffect` 是同步执行的——只要它没跑完，浏览器就不能绘制这一帧。

所以它的代价是：

- 逻辑写重了会卡首屏、卡交互
- 多个组件都用 layout effect 会叠加阻塞

经验法则：

- 默认用 `useEffect`
- 只有出现“可见闪烁/布局跳动/测量必须同步”才换 `useLayoutEffect`

---

## 常见误区清单

- 用它来发请求（不应该，副作用不该阻塞绘制；用 useEffect）
- 在里面做很重的计算（会卡 UI）
- 依赖数组漏写导致测量基于旧值
- 只要能用 useEffect 就尽量不要用 useLayoutEffect（避免性能问题）

---

## SSR 注意点

在服务端渲染（SSR）环境中，`useLayoutEffect` 在服务器上没有 DOM，React 通常会给出警告（因为它无法在服务器执行布局相关逻辑）。

常见处理方式：

- 仅在客户端使用 layout effect
- 或封装一个“同构 effect”：

```jsx
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
```

---

## 记忆模型

- `useLayoutEffect`：DOM 更新后、绘制前，同步执行，适合测量与防闪
- `useEffect`：绘制后执行，更轻、更推荐
- 选择标准：是否需要“首帧就正确”，以及是否必须同步读写 DOM

---

## 最小练习题

实现一个组件：渲染后立刻读取自身高度并把高度显示出来，且要求不闪烁。

提示：用 `useLayoutEffect` + `ref` + `getBoundingClientRect`。

```jsx
function MeasureMe() {
  const ref = useRef(null)
  const [h, setH] = useState(0)

  // TODO: useLayoutEffect 测量高度

  return (
    <div>
      <div ref={ref} style={{ padding: 16, border: '1px solid #ccc' }}>
        content
      </div>
      <div>height: {h}</div>
    </div>
  )
}
```

参考实现：

```jsx
useLayoutEffect(() => {
  if (!ref.current) return
  const { height } = ref.current.getBoundingClientRect()
  setH(height)
}, [])
```
