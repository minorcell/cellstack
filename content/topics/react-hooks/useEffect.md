---
title: 'useEffect'
description: '从副作用与渲染的关系，到依赖数组、清理函数、执行时机与常见坑的系统讲解'
date: 2026-01-11
order: 2
---

## 先用一句话理解 useEffect

`useEffect` 用来在函数组件渲染后执行“副作用逻辑”，并在需要时进行清理。

副作用可以理解为：**不属于纯 UI 计算**的事情，比如订阅、请求、写入 DOM、计时器、读写本地存储等。

---

## 为什么需要 useEffect

函数组件渲染应该尽量“纯”：同样输入得到同样输出。

但现实里你总要做一些会影响外部世界的事情：

- 发请求拿数据
- 订阅 WebSocket / 事件
- 操作 DOM（读尺寸、聚焦输入框）
- 设置定时器
- 修改 `document.title`

这些都不适合写在渲染过程里，因为渲染可能被打断、重试、重复执行。

`useEffect` 的定位就是：**把这些逻辑放到渲染完成之后**去做。

---

## 最基本用法

```jsx
import { useEffect, useState } from 'react'

function TitleDemo() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `count: ${count}`
  }, [count])

  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}
```

结构拆开看：

- 第一个参数：副作用函数（effect）
- 第二个参数：依赖数组（deps）

---

## 执行时机：什么时候会跑

可以用一句话记住：

- **首次渲染完成后**会执行一次
- **依赖变化导致重新渲染后**，在渲染提交到 DOM 后再执行

也就是说：`useEffect` 的逻辑不在 render 期间跑，而是在“提交后”跑。

---

## 依赖数组决定“何时重跑”

依赖数组本质是：告诉 React 你的 effect 用到了哪些“渲染时的变量”，当它们变化才需要重新执行。

### 依赖为空数组：只在挂载时跑一次

```jsx
useEffect(() => {
  console.log('mounted')
}, [])
```

常见用途：初始化订阅、初始化一次性的逻辑。

### 不写依赖数组：每次渲染后都跑

```jsx
useEffect(() => {
  console.log('rendered')
})
```

通常不推荐，除非你明确需要“每次渲染都同步外部”。

### 写依赖：依赖变了才跑

```jsx
useEffect(() => {
  // 用到了 userId
  fetchUser(userId)
}, [userId])
```

---

## 清理函数：解决“订阅/计时器泄漏”

如果 effect 创建了“持续性资源”，必须返回清理函数：

```jsx
useEffect(() => {
  const id = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => clearInterval(id)
}, [])
```

清理函数会在两种时机触发：

- 组件卸载时
- 下一次 effect 重新执行前（依赖变化触发重跑时，会先清理上一次）

这点非常关键：可以保证订阅不会叠加、计时器不会越开越多。

---

## 典型场景讲透

## 数据请求：依赖驱动

```jsx
useEffect(() => {
  let cancelled = false

  async function run() {
    const res = await fetch(`/api/user/${userId}`)
    const data = await res.json()
    if (!cancelled) setUser(data)
  }

  run()

  return () => {
    cancelled = true
  }
}, [userId])
```

说明：

- 依赖 `userId`：userId 变了就重新请求
- 用 `cancelled` 防止“旧请求回来了覆盖新数据”的竞态

更现代的做法可以用 `AbortController`（更标准）：

```jsx
useEffect(() => {
  const controller = new AbortController()

  fetch(`/api/user/${userId}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((err) => {
      if (err.name !== 'AbortError') throw err
    })

  return () => controller.abort()
}, [userId])
```

---

## 事件订阅：不要忘清理

```jsx
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth)
  window.addEventListener('resize', onResize)
  onResize()

  return () => window.removeEventListener('resize', onResize)
}, [])
```

---

## effect 里用到的函数：依赖怎么写

很多“依赖地狱”来自这里。

```jsx
function Demo({ query }) {
  const [data, setData] = useState(null);

  const load = async () => {
    const res = await fetch(`/api?q=${query}`);
    setData(await res.json());
  };

  useEffect(() => {
    load();
  }, [load]); // 这里会一直变，导致无限重跑

  ...
}
```

原因：`load` 是组件内函数，每次渲染都会创建新引用，所以依赖永远变化。

常见解决方案：

### 方案 A：把函数写进 effect

```jsx
useEffect(() => {
  async function load() {
    const res = await fetch(`/api?q=${query}`)
    setData(await res.json())
  }
  load()
}, [query])
```

这是最直接也最推荐的方式之一。

### 方案 B：用 useCallback 稳定函数引用

```jsx
const load = useCallback(async () => {
  const res = await fetch(`/api?q=${query}`)
  setData(await res.json())
}, [query])

useEffect(() => {
  load()
}, [load])
```

适合：这个函数还要传给子组件，或者多处复用。

---

## 闭包陷阱：为什么 effect 里拿到的是旧值

看这个例子：

```jsx
useEffect(() => {
  const id = setInterval(() => {
    console.log(count)
  }, 1000)
  return () => clearInterval(id)
}, [])
```

你会发现它永远打印初始的 `count`。

原因：依赖是 `[]`，effect 只执行一次，闭包捕获的是那次渲染的 `count`。

常见解决方法：

### 方法 A：把 count 放进依赖并重建 interval

```jsx
useEffect(() => {
  const id = setInterval(() => {
    console.log(count)
  }, 1000)
  return () => clearInterval(id)
}, [count])
```

缺点：count 每变一次就重建定时器。

### 方法 B：用函数式更新避免依赖

如果你只是要“基于旧值更新”，不需要读 count：

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1)
  }, 1000)
  return () => clearInterval(id)
}, [])
```

### 方法 C：用 useRef 保存最新值

```jsx
const countRef = useRef(count)
useEffect(() => {
  countRef.current = count
}, [count])

useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current)
  }, 1000)
  return () => clearInterval(id)
}, [])
```

适合：你需要在“长期存在的回调”里读最新状态。

---

## Strict Mode 下为什么 effect 会执行两次

在开发环境中，React 的 Strict Mode 可能会故意让某些生命周期（包括 effect）出现“额外的 mount/unmount/mount”流程，用来帮助你发现副作用是否可被正确清理。

你需要做的不是“阻止它”，而是确保：

- effect 是幂等的，或
- 清理逻辑完整可靠

生产环境不会这么做，但你的代码应该能承受。

---

## useEffect 与 useLayoutEffect 的区别

- `useEffect`：在浏览器绘制之后执行（更不阻塞渲染）
- `useLayoutEffect`：在 DOM 更新后、绘制前执行（适合测量布局/同步读写 DOM）

经验法则：

- 大多数场景用 `useEffect`
- 只有当你需要在绘制前测量/同步布局，才用 `useLayoutEffect`

---

## 常见误区清单

- 依赖数组乱写或空写，导致拿到旧值或逻辑不更新
- 订阅/定时器/事件监听没清理，造成泄漏或重复绑定
- 把组件内函数直接放依赖，导致无限重跑
- effect 里发请求不处理竞态，旧请求覆盖新数据
- 试图在渲染里做副作用（比如直接改 title、直接 fetch）

---

## 记忆模型

- 渲染：计算 UI（尽量纯）
- 提交：React 把结果更新到 DOM
- effect：渲染提交后，执行副作用
- 清理：下一次 effect 前 / 卸载时执行

---

## 最小练习题

实现一个倒计时组件，传入 `seconds`，每秒减少 1，减到 0 停止，并在卸载时清理定时器。

```jsx
function Countdown({ seconds }) {
  const [left, setLeft] = useState(seconds)

  // TODO: useEffect 实现倒计时

  return <div>{left}</div>
}
```

参考实现：

```jsx
useEffect(() => {
  setLeft(seconds)
}, [seconds])

useEffect(() => {
  if (left <= 0) return

  const id = setInterval(() => {
    setLeft((x) => x - 1)
  }, 1000)

  return () => clearInterval(id)
}, [left])
```
