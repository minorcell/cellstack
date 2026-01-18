---
title: 'useImperativeHandle'
description: '讲清 forwardRef 的配合方式、如何对外暴露“命令式能力”、常见封装模式与坑'
date: 2026-01-18
order: 9
---

## 先用一句话理解 useImperativeHandle

`useImperativeHandle` 用来配合 `forwardRef`，让组件**自定义对外暴露的 ref 内容**：你可以不暴露真实 DOM，而是只暴露一组“命令式方法”（例如 `focus()`、`reset()`）。

---

## 为什么需要它

默认情况下：

- `ref` 挂在原生 DOM 上：父组件能拿到 DOM 节点
- `ref` 挂在自定义组件上：父组件拿不到内部 DOM（函数组件本身没有实例）

有时父组件确实需要“控制”子组件的某些行为，比如：

- 聚焦输入框、选中文本
- 触发子组件内部的校验/提交
- 重置表单、滚动到某位置

但你又不想把子组件内部细节（真实 DOM/内部结构）直接暴露出去。

这时用 `useImperativeHandle`：**对外给一个“接口”，对内随便实现。**

---

## 最基本用法：forwardRef + useImperativeHandle

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react'

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = ''
    },
  }))

  return <input ref={inputRef} {...props} />
})
```

父组件使用：

```jsx
function Parent() {
  const ref = useRef(null)

  return (
    <>
      <FancyInput ref={ref} />
      <button onClick={() => ref.current?.focus()}>focus</button>
      <button onClick={() => ref.current?.clear()}>clear</button>
    </>
  )
}
```

此时父组件拿到的不是 `<input>` DOM，而是：

```js
{ focus: Function, clear: Function }
```

---

## 为什么必须配合 forwardRef

函数组件默认不接收 `ref` 作为 props。

`forwardRef` 的作用就是：让你的组件可以接到父组件传进来的 `ref`。

没有 `forwardRef`，`useImperativeHandle` 就无从谈起。

---

## useImperativeHandle 的第二个参数：依赖数组

完整签名：

```jsx
useImperativeHandle(ref, createHandle, deps?)
```

- `createHandle` 返回你要暴露的对象
- `deps` 控制何时重新生成这个对象

一般情况：

- 暴露的方法只依赖稳定引用（如 `inputRef`），可以写 `[]`
- 如果暴露的方法需要用到 props/state，则应把依赖写进去，避免闭包旧值

示例：暴露一个使用最新 props 的方法

```jsx
useImperativeHandle(
  ref,
  () => ({
    getValue: () => props.value,
  }),
  [props.value],
)
```

---

## 推荐暴露“最小接口”

不要把内部所有东西都暴露出去：

- ✅ 暴露：`focus()`、`scrollToBottom()`、`reset()`
- ❌ 暴露：内部 DOM ref、内部 state、内部实现细节

这样组件才能真正可复用、可重构。

---

## 常见封装模式

## 模式一：表单组件暴露 validate / reset

```jsx
const Form = forwardRef(function Form(_, ref) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    // ...计算错误
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const reset = () => setErrors({})

  useImperativeHandle(ref, () => ({ validate, reset }), [errors])

  return <div>{/* form fields */}</div>
})
```

注意：上面把 `errors` 放进 deps 不是必须，但如果 `validate/reset` 里读到某些会变化的值，就要确保依赖正确，或者改成函数式/refs 方案。

---

## 模式二：列表组件暴露 scrollToIndex

```jsx
const List = forwardRef(function List({ items }, ref) {
  const containerRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      scrollToTop: () => {
        containerRef.current?.scrollTo({ top: 0 })
      },
    }),
    [],
  )

  return (
    <div ref={containerRef} style={{ overflow: 'auto', maxHeight: 200 }}>
      {items.map((x) => (
        <div key={x.id}>{x.text}</div>
      ))}
    </div>
  )
})
```

---

## 常见坑与排查

## ref.current 是 null

常见原因：

- 子组件没用 `forwardRef`
- 父组件在首次渲染就访问 ref（未挂载完成）

解决：

- 确认子组件是 `forwardRef(...)`
- 需要在事件里访问，或在 `useEffect` 里访问

## 暴露的方法读到旧 state/props

原因：`createHandle` 返回的方法闭包捕获旧值。

解决思路：

- 把相关值放进 `deps`
- 或用 `useRef` 保存最新值，再在暴露方法里读 ref

示例：ref 存最新值

```jsx
const valueRef = useRef(value)
useEffect(() => {
  valueRef.current = value
}, [value])

useImperativeHandle(
  ref,
  () => ({
    getValue: () => valueRef.current,
  }),
  [],
)
```

---

## 什么时候该用、什么时候不该用

适合：

- 需要暴露少量“命令式操作”
- 你想对外隐藏 DOM/内部细节
- 与第三方库集成（需要 imperative API）

不适合：

- 用它来绕过 React 数据流（例如到处从父组件直接改子组件内部状态）
- 用它替代正常的 props/state 设计（能声明式就声明式）

一句话：**能声明式就声明式，必须命令式才 useImperativeHandle。**

---

## 记忆模型

- `forwardRef`：让父组件能把 ref 传进来
- `useImperativeHandle`：决定 ref.current 暴露什么
- 暴露最小接口，避免泄漏内部实现

---

## 最小练习题

实现一个 `SearchInput` 组件：

- 内部是 input
- 对外暴露：`focus()`、`setValue(v)`、`getValue()`

参考实现：

```jsx
const SearchInput = forwardRef(function SearchInput(_, ref) {
  const inputRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      setValue: (v) => {
        if (inputRef.current) inputRef.current.value = v
      },
      getValue: () => inputRef.current?.value ?? '',
    }),
    [],
  )

  return <input ref={inputRef} placeholder="search..." />
})
```
