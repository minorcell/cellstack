---
title: 'useMemo'
description: '从“缓存计算结果”到依赖数组、引用稳定、与 useCallback 的区别及常见误区的系统讲解'
date: 2026-01-13
order: 5
---

## 先用一句话理解 useMemo

`useMemo` 用来在多次渲染之间**缓存一次计算的结果**：依赖不变就复用上次结果，依赖变了才重新计算。

---

## 为什么需要 useMemo

函数组件每次渲染都会重新执行，意味着：

- 组件内的表达式会重新计算
- 组件内创建的对象/数组/映射会重新创建引用

有两类常见需求：

- 计算很贵：不想每次渲染都算一遍
- 引用要稳定：不想因为“新对象引用”导致子组件/Effect/Context 误触发

`useMemo` 主要解决这两类问题。

---

## 最基本用法

```jsx
import { useMemo } from 'react'

function List({ items, keyword }) {
  const filtered = useMemo(() => {
    return items.filter((x) => x.includes(keyword))
  }, [items, keyword])

  return (
    <ul>
      {filtered.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  )
}
```

结构拆开看：

- 第一个参数：返回你想缓存的值的计算函数
- 第二个参数：依赖数组（deps）

---

## 依赖数组决定“何时重新计算”

### 依赖不变：复用缓存

React 会把上次算出来的值保存起来，下次渲染如果依赖用 `Object.is` 判断都没变，就直接返回旧值。

### 依赖变化：重新计算并更新缓存

依赖任何一个变了，就会调用计算函数重新算一遍。

---

## useMemo 不是“只算一次”

很多人把它当成“只执行一次”，这是误解。

- 它会在组件首次渲染时执行一次计算
- 之后是否再执行，取决于依赖是否变化
- 组件卸载后缓存就没了，再挂载会重新算

---

## 场景一：昂贵计算缓存

比如排序 + 聚合很重：

```jsx
const stats = useMemo(() => {
  const sorted = [...data].sort((a, b) => a.value - b.value)
  const sum = sorted.reduce((acc, x) => acc + x.value, 0)
  return { sorted, sum }
}, [data])
```

注意：如果 `data` 每次渲染都变引用（哪怕内容一样），依然会重算。
所以真正能省下来的前提是：依赖本身要“稳定”。

---

## 场景二：稳定引用，避免无意义重渲染

常见坑：父组件每次 render 都创建新对象，导致子组件 memo 失效。

```jsx
const config = { pageSize: 20, showAvatar: true }

return <UserTable config={config} />
```

即使值没变，`config` 每次都是新对象。解决：

```jsx
const config = useMemo(() => {
  return { pageSize: 20, showAvatar: true }
}, [])

return <UserTable config={config} />
```

---

## 场景三：配合 Context Provider，减少消费者重渲染

```jsx
const value = useMemo(() => ({ user, logout }), [user, logout])

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
```

如果不 memo，`{}` 每次都是新引用，所有 useContext 消费者会频繁重渲染。

---

## useMemo vs useCallback

记法：

- `useMemo`：缓存“值”
- `useCallback`：缓存“函数”（本质上等价于 `useMemo(() => fn, deps)`）

例子：

```jsx
const onClick = useCallback(() => {
  setCount((c) => c + 1)
}, [])
```

等价于：

```jsx
const onClick = useMemo(() => {
  return () => setCount((c) => c + 1)
}, [])
```

一般写事件处理函数用 `useCallback` 更直观。

---

## useMemo 不是性能万能药

`useMemo` 本身也有成本：

- 依赖比较成本
- 维护缓存成本
- 让代码更复杂、更难读

经验法则：

- 计算真的很贵，或
- 引用稳定真的能减少很多下游渲染/Effect/Context 更新

才值得加。

如果只是“想优化”，但没有证据，通常先别加。

---

## React 可能丢弃 memo 缓存吗

可以把 `useMemo` 当作“性能提示”而不是“语义保证”。

在某些情况下（比如并发渲染/中断重试等），React 可能会放弃某次计算的缓存并重新计算。

所以：

- 不要把 `useMemo` 当成“必须只计算一次”的逻辑依赖
- 你的计算函数必须是纯的（同依赖输入→同结果，不要在里面做副作用）

---

## 常见误区清单

- 把 useMemo 当成“只运行一次”
- 依赖数组漏写，导致用到旧值
- 依赖写太多（写进不稳定对象），导致每次都重算，等于白用
- 在 useMemo 里做副作用（请求、订阅、改 DOM）——这些应该用 useEffect
- 用 useMemo 缓存 JSX 以为能避免渲染（通常意义不大，除非配合稳定 props 与 memo 化子组件）

---

## 记忆模型

- `useMemo` 缓存的是“上一次计算结果”
- 依赖不变 → 复用结果；依赖变 → 重新计算
- 更常用的价值：**稳定引用**，避免下游误触发
- 不要让它承载业务语义，只用于性能/引用稳定

---

## 最小练习题

有一个搜索列表组件，输入框变化会触发渲染。请用 `useMemo` 避免对 `items` 的过滤在每次输入无关状态变化时重复执行。

```jsx
function Search({ items }) {
  const [keyword, setKeyword] = useState('')
  const [show, setShow] = useState(true)

  // TODO: 用 useMemo 缓存 filtered
  const filtered = items.filter((x) => x.includes(keyword))

  return (
    <>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <button onClick={() => setShow((s) => !s)}>toggle</button>
      {show && (
        <ul>
          {filtered.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
    </>
  )
}
```

参考实现：

```jsx
const filtered = useMemo(() => {
  return items.filter((x) => x.includes(keyword))
}, [items, keyword])
```
