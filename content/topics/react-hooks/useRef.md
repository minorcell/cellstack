---
title: 'useRef'
description: '从“跨渲染保存值但不触发渲染”到 DOM 引用、避免闭包陷阱与常见用法的系统讲解'
date: 2026-01-12
order: 4
---

## 先用一句话理解 useRef

`useRef` 用来创建一个**可变容器**（`{ current: ... }`），它的 `current` 值能在多次渲染之间保持不变，但**修改它不会触发重新渲染**。

---

## useRef 返回的到底是什么

```jsx
const ref = useRef(initialValue)
```

返回值形状是：

```js
{
  current: initialValue
}
```

特点：

- 这个对象在组件整个生命周期内**引用稳定**（不会因为渲染变）
- 你可以随时改 `ref.current`
- 改完不会引起 UI 自动刷新

---

## 最常见用法：拿到 DOM 节点

```jsx
import { useEffect, useRef } from 'react'

function FocusInput() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return <input ref={inputRef} placeholder="I will be focused" />
}
```

要点：

- `ref={inputRef}` 会让 React 在提交 DOM 后把真实节点塞进 `inputRef.current`
- 访问 DOM 一般放到 `useEffect/useLayoutEffect` 里做

---

## useRef vs useState：核心区别

### useState

- 用于“影响渲染”的数据
- 更新会触发重新渲染

### useRef

- 用于“不需要驱动渲染”的数据
- 更新不会触发重新渲染

经验法则：

- 改了要让 UI 变：`useState`
- 改了只是给逻辑用：`useRef`

---

## 用 useRef 跨渲染保存值：计时器 id、订阅句柄等

```jsx
function Timer() {
  const timerIdRef = useRef(null)

  const start = () => {
    if (timerIdRef.current) return
    timerIdRef.current = setInterval(() => {
      console.log('tick')
    }, 1000)
  }

  const stop = () => {
    clearInterval(timerIdRef.current)
    timerIdRef.current = null
  }

  return (
    <>
      <button onClick={start}>start</button>
      <button onClick={stop}>stop</button>
    </>
  )
}
```

如果你用 `useState` 存 interval id，会带来无意义重渲染；用 `useRef` 更合适。

---

## 解决闭包陷阱：让回调拿到最新值

问题场景：事件监听/定时器里读到旧 state。

```jsx
useEffect(() => {
  const id = setInterval(() => {
    console.log(count) // 可能永远是旧值
  }, 1000)
  return () => clearInterval(id)
}, [])
```

解决：用 ref 存最新值。

```jsx
const countRef = useRef(count)

useEffect(() => {
  countRef.current = count
}, [count])

useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current) // 永远最新
  }, 1000)
  return () => clearInterval(id)
}, [])
```

记住：ref 是“可变外置存储”，回调闭包引用的是 ref 这个稳定对象，所以能读到更新后的 `current`。

---

## ref 初始化值的时机

和 `useState` 类似：`useRef(initialValue)` 的 initialValue 仅在首次挂载时用于设置初始 `current`。

但与 `useState` 不同的是：

- `useRef` 没有 setter
- 你之后直接改 `ref.current`

---

## 用 useRef 做“实例变量”：统计渲染次数

```jsx
function RenderCount() {
  const renders = useRef(0)
  renders.current += 1

  return <div>renders: {renders.current}</div>
}
```

注意：这会在渲染过程中修改 ref（通常没问题），但不要在这里做副作用（例如读写 DOM、发请求）。

---

## forwardRef 与 useRef：组件对外暴露 DOM/方法

父组件想拿到子组件里的 input：

```jsx
const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />
})

function Parent() {
  const ref = useRef(null)
  return (
    <>
      <Input ref={ref} />
      <button onClick={() => ref.current?.focus()}>focus</button>
    </>
  )
}
```

更进一步：子组件不想暴露 DOM，想暴露方法，用 `useImperativeHandle`：

```jsx
const FancyInput = forwardRef(function FancyInput(_, ref) {
  const inputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => (inputRef.current.value = ''),
  }))

  return <input ref={inputRef} />
})
```

---

## 常见误区清单

- 以为改 `ref.current` 会刷新 UI（不会）
- 把“渲染相关数据”放 ref，导致 UI 不更新
- 在 ref 里存对象并原地修改，然后又指望组件重渲染
- 依赖 ref.current 写进 useEffect deps（通常没意义，因为 ref 引用不变；应依赖真正的 state/props）

---

## 记忆模型

- `useRef` 给你一个“永远同一个盒子”
- `ref.current` 是盒子里的内容，可以随意改
- 改盒子里的内容不会触发渲染
- DOM ref 是 `useRef` 的一个经典应用场景

---

## 最小练习题

实现一个输入框与按钮：点击按钮时输出“上一次输入值”和“当前输入值”。

提示：用 `useRef` 保存上一次值。

```jsx
function LastValue() {
  const [value, setValue] = useState('')
  const lastRef = useRef('')

  const log = () => {
    console.log('last:', lastRef.current, 'current:', value)
    lastRef.current = value
  }

  return (
    <>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={log}>log</button>
    </>
  )
}
```
