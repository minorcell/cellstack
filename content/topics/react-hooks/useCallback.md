---
title: 'useCallback'
description: '从“缓存函数引用”到依赖数组、配合 memo/子组件、避免闭包陷阱与常见误区的系统讲解'
date: 2026-01-14
order: 6
---

## 先用一句话理解 useCallback

`useCallback` 用来在多次渲染之间**缓存函数本身的引用**：依赖不变就复用同一个函数引用，依赖变了才创建新函数。

---

## 为什么需要 useCallback

函数组件每次渲染都会重新执行，组件内声明的函数也会重新创建：

```jsx
function Parent() {
  const handleClick = () => { ... };
  return <Child onClick={handleClick} />;
}
```

即使逻辑完全相同，`handleClick` 的引用每次都变，这会带来两个常见问题：

- 子组件用了 `React.memo` 也挡不住重渲染（因为 props 引用变了）
- `useEffect` 依赖里放了这个函数，导致 effect 频繁重跑

`useCallback` 的价值就是：**让函数引用稳定**。

---

## 最基本用法

```jsx
import { useCallback, useState } from 'react'

function Counter() {
  const [n, setN] = useState(0)

  const add = useCallback(() => {
    setN((x) => x + 1)
  }, [])

  return <button onClick={add}>{n}</button>
}
```

结构拆开看：

- 第一个参数：你要缓存的函数
- 第二个参数：依赖数组（deps）

---

## 依赖数组决定“何时换新函数”

- 依赖不变：返回同一个函数引用
- 依赖变化：创建并返回一个新函数（捕获新的闭包变量）

这点很重要：`useCallback` 不会让函数“更快”，它只是让“引用不变”。

---

## useCallback 与 useMemo 的关系

记法：

- `useMemo` 缓存“值”
- `useCallback` 缓存“函数”

它们本质关系是：

```jsx
useCallback(fn, deps) === useMemo(() => fn, deps)
```

所以你可以把 `useCallback` 当成语义更明确的“函数版 useMemo”。

---

## 典型场景一：配合 React.memo 减少子组件重渲染

子组件：

```jsx
const Child = React.memo(function Child({ onAdd }) {
  console.log('Child render')
  return <button onClick={onAdd}>add</button>
})
```

父组件如果这样写：

```jsx
function Parent() {
  const [n, setN] = useState(0)

  const onAdd = () => setN((x) => x + 1)

  return (
    <>
      <div>{n}</div>
      <Child onAdd={onAdd} />
    </>
  )
}
```

`Parent` 每次渲染都会创建新 `onAdd`，导致 `Child` 也会渲染。

改成：

```jsx
const onAdd = useCallback(() => setN((x) => x + 1), [])
```

只要依赖不变，`Child` 就能真正享受 memo 的收益。

---

## 典型场景二：避免 useEffect 因函数依赖而频繁重跑

```jsx
function Demo({ query }) {
  const fetchData = useCallback(async () => {
    const res = await fetch(`/api?q=${query}`)
    return res.json()
  }, [query])

  useEffect(() => {
    fetchData().then(console.log)
  }, [fetchData])
}
```

这里 `fetchData` 依赖 `query`，当 query 变时函数变，effect 也合理重跑。

---

## 最常见坑：依赖数组写错导致“闭包旧值”

看这个例子：

```jsx
function Demo() {
  const [count, setCount] = useState(0)

  const add = useCallback(() => {
    setCount(count + 1)
  }, []) // ❌
}
```

因为 deps 是 `[]`，`add` 只创建一次，闭包里永远是初始 `count`，点击永远只能把 0 加到 1。

两种修法：

### 修法 A：把 count 放进依赖

```jsx
const add = useCallback(() => {
  setCount(count + 1)
}, [count])
```

### 修法 B：用函数式更新消除依赖（更常见）

```jsx
const add = useCallback(() => {
  setCount((c) => c + 1)
}, [])
```

经验：只要更新依赖旧 state，优先用函数式更新，这样 deps 更干净。

---

## useCallback 不是默认必用

如果你不满足下面任意一个条件，通常不需要用：

- 你把函数作为 props 传给 memo 化子组件，并且子组件重渲染确实是瓶颈
- 你把函数放进某个 Hook 的依赖数组里（useEffect/useMemo 等），并且你需要控制重跑频率
- 你需要函数引用稳定（例如订阅/取消订阅、第三方库要求 stable callback）

否则加 `useCallback` 可能只是增加代码复杂度。

---

## 什么时候用 useRef 而不是 useCallback

当你遇到“我想要一个永远稳定的回调引用，但里面要拿最新值”：

- `useCallback` 要么依赖变→引用变
- `[]` 稳定引用→闭包可能旧

这时常见组合是：`useRef` 存最新值 + 稳定函数读 ref。

```jsx
function Demo({ onEvent }) {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const handler = useCallback((e) => {
    onEventRef.current(e)
  }, [])

  return <div onClick={handler}>...</div>
}
```

---

## 常见误区清单

- 以为 useCallback 能提升函数执行速度（它只稳定引用）
- deps 写 `[]` 却在回调里读 state/props，导致闭包旧值
- deps 写成不稳定对象（每次都新引用），导致 useCallback 失效
- 为了“看起来专业”到处加 useCallback，导致代码更难维护
- 忽略真正的优化手段：减少渲染、拆分组件、memo 合理使用、避免不必要 state

---

## 记忆模型

- `useCallback` 缓存的是“函数引用”
- 依赖不变 → 引用不变；依赖变 → 新函数
- 想稳定且不读旧值：优先函数式更新；必要时 ref 存最新值

---

## 最小练习题

父组件有两个 state：`count` 和 `text`。要求：

- `text` 改变时子组件不重渲染
- 点击子组件按钮能正确让 `count + 1`

提示：`Child` 用 `React.memo`，父组件用 `useCallback`。

```jsx
const Child = React.memo(function Child({ onAdd }) {
  console.log('Child render')
  return <button onClick={onAdd}>add</button>
})

function Parent() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // TODO: 实现稳定的 onAdd，且能正确更新 count
  const onAdd = () => setCount(count + 1)

  return (
    <>
      <div>count: {count}</div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <Child onAdd={onAdd} />
    </>
  )
}
```

参考答案：

```jsx
const onAdd = useCallback(() => {
  setCount((c) => c + 1)
}, [])
```
