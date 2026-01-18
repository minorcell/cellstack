---
title: 'useTransition'
description: '讲清“过渡更新”的意义、startTransition 的用法、isPending 的交互体验、与 useDeferredValue 的区别及常见坑'
date: 2026-01-18
order: 10
---

## 先用一句话理解 useTransition

`useTransition` 用来把一部分“可以稍后再更新”的状态更新标记为**低优先级的过渡更新**，从而让输入、点击等高优先级交互保持流畅，并且你还能拿到 `isPending` 来展示“正在更新”的反馈。

---

## 背景：为什么需要“过渡更新”

在传统渲染里，用户输入一次，你可能同时做两件事：

- 立即更新输入框的值（必须立刻响应）
- 根据输入框的值去渲染一个很重的列表/图表（可以慢一点）

如果重渲染很贵，输入会卡顿：用户打字明显延迟。

`useTransition` 的目标就是把这两类更新“分开优先级”：

- 立即的：高优先级（比如输入框 value）
- 可延后的：低优先级（比如过滤后的列表）

---

## API 形状与返回值

```jsx
const [isPending, startTransition] = useTransition()
```

- `isPending`：当前是否有“过渡更新”正在进行（可以用来显示 loading 状态）
- `startTransition(fn)`：把 `fn` 里触发的状态更新标记为 transition（低优先级）

---

## 最经典例子：输入不卡，列表慢一点也没关系

```jsx
import { useMemo, useState, useTransition } from 'react'

function BigList({ query, items }) {
  // 假设这里渲染很重
  const filtered = useMemo(() => {
    return items.filter((x) => x.includes(query))
  }, [items, query])

  return (
    <ul>
      {filtered.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  )
}

export default function SearchDemo({ items }) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const onChange = (e) => {
    const v = e.target.value
    setInput(v) // 高优先级：立刻更新输入框

    startTransition(() => {
      setQuery(v) // 低优先级：用于重渲染大列表
    })
  }

  return (
    <div>
      <input value={input} onChange={onChange} placeholder="type..." />
      {isPending && <div>updating...</div>}
      <BigList query={query} items={items} />
    </div>
  )
}
```

你会得到的体验：

- 输入框跟手
- 列表可能稍晚更新，但 UI 不“卡死”
- `isPending` 可以给用户反馈，避免“没反应”的错觉

---

## startTransition 里该放什么、不该放什么

适合放：

- 会触发昂贵渲染的状态更新（列表过滤、排序、图表、路由切换等）
- 非关键的 UI 更新（比如某个面板的内容刷新）

不适合放：

- 必须立刻生效的交互反馈（输入框 value、按钮按下状态、hover 高亮）
- “需要同步”的状态（例如你下一行代码就依赖更新后的 state）
- 依赖精确时序的逻辑（transition 更新可能被打断、重试）

记住：transition 是“让步”的更新，不保证立刻完成。

---

## isPending 的正确用法：提示而不是“禁用一切”

`isPending` 更适合做：

- 显示“正在更新…”
- 让慢区域变灰、加 skeleton
- 显示一个很轻的 spinner

不建议简单粗暴地：

- 一 pending 就禁用整个表单（可能让用户觉得被锁住）
- 一 pending 就替换整页 UI（会造成闪烁）

更好的做法是把“慢区域”标记为 pending：

```jsx
<div style={{ opacity: isPending ? 0.6 : 1 }}>
  <BigList ... />
</div>
```

---

## 与 useDeferredValue 的区别

两者都用于“让更新不阻塞输入”，但思路不同：

### useTransition：你主动把某次更新降级

- 你决定哪些 setState 属于 transition
- 你能拿到 `isPending`
- 适合“明确的一组更新需要降级”的场景

### useDeferredValue：你让某个值自动延后

```jsx
const deferredQuery = useDeferredValue(input)
```

- 你还是只维护一个 `input`
- React 自己在合适的时候推进 deferred 值
- 更适合“我就是想让这个派生值慢一点”的场景

简单选型：

- 需要手动控制、需要 pending UI：用 `useTransition`
- 想让某个值自然延后、少写一个 state：用 `useDeferredValue`

---

## 常见坑：以为 transition 会“并行跑代码”

`startTransition` 不是开线程，也不是把计算放到后台。

它只是在 React 的调度层面告诉你：这些更新优先级更低，React 会尽量不阻塞更重要的更新。

如果你在 transition 里写了大量同步 CPU 计算（比如巨量循环），依然会卡。

这种计算要么：

- 通过 memo/拆分渲染减少成本
- 把重计算移出主线程（Web Worker）
- 虚拟列表/分页等降低渲染量

---

## 常见坑：依赖旧值与闭包

如果你在 transition 里依赖 state，建议用函数式更新，避免闭包旧值：

```jsx
startTransition(() => {
  setPage((p) => p + 1)
})
```

---

## 常见坑：把“输入值”也放进 transition

错误示例：

```jsx
startTransition(() => {
  setInput(v)
})
```

这样输入框本身就变成低优先级，用户会感觉打字迟钝，完全违背初衷。

原则：输入框 value 必须高优先级更新。

---

## 典型进阶：路由切换的过渡体验

当页面切换会触发大范围渲染时，可以用 transition 包住“切换视图”的更新，并用 `isPending` 给出过渡提示：

```jsx
const [page, setPage] = useState('home')
const [isPending, startTransition] = useTransition()

const go = (next) => {
  startTransition(() => setPage(next))
}
```

配合 UI：

- pending 时显示顶部进度条
- 旧页面保持可交互或部分可交互，直到新页面准备好（视场景而定）

---

## 记忆模型

- 高优先级：用户正在输入/点击，必须立刻反馈
- 低优先级：内容更新可以慢一点，但不要卡住交互
- `startTransition`：把“可延后更新”降级
- `isPending`：告诉你过渡还没完成，可做轻提示

---

## 最小练习题

实现一个搜索组件，要求：

- 输入框实时更新不丢字
- 列表渲染较慢时显示 “updating...”
- 列表更新用 transition

提示骨架：

```jsx
function Search({ items }) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const onChange = (e) => {
    const v = e.target.value
    // TODO
  }

  const filtered = useMemo(() => {
    // TODO
  }, [items, query])

  return (
    <>
      <input value={input} onChange={onChange} />
      {isPending && <div>updating...</div>}
      <ul>
        {filtered.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </>
  )
}
```

参考实现要点：

- `setInput(v)` 放外面
- `setQuery(v)` 放 `startTransition` 里
- `filtered` 依赖 `query`
