---
title: 'useState'
description: '从状态是什么、为什么需要 useState，到更新机制、函数式更新与常见坑的系统讲解'
date: 2026-01-10
order: 1
---

## 先用一句话理解 useState

`useState` 是 React 函数组件里用来**保存组件私有状态**并在状态变化时**触发重新渲染**的 Hook。

你可以把它当成：“给函数组件加上可记忆的数据，并在数据变化时让 UI 自动刷新”。

---

## 为什么函数组件需要状态

函数组件本质上就是一个函数：输入 props，输出 UI。

问题在于：函数每次执行都会重新计算，如果你希望某个值能“跨渲染保留”，就需要一个机制让 React 帮你把值存起来，并在更新后重新调用组件函数——这就是 `useState` 做的事。

---

## 最基本用法

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>count: {count}</button>
}
```

这里发生了什么：

- `count`：当前状态值
- `setCount`：更新状态的函数（不要直接改 count）
- `useState(0)`：初始值为 0（仅在首次挂载时使用）

---

## 解构出来的两个值分别是什么

### state 值：用于渲染

`count` 会参与渲染。当 React 渲染组件时，它会读取 `count` 的当前值来生成 UI。

### setter：触发状态更新与重新渲染

`setCount(next)` 会告诉 React：“把这个状态更新为 next，并在合适时机重新渲染”。

注意：`setCount` 不是“立刻改变量”，而是**发起一次更新请求**。

---

## 初始值只会用一次

很多人会误以为每次渲染都会执行 `useState(0)` 并把 count 变回 0。

事实是：**只有首次挂载时**会用到初始值。后续渲染会忽略初始值参数，直接读到 React 保存的状态。

---

## 惰性初始化：初始值很贵时怎么写

如果初始值需要复杂计算，别写成这样：

```jsx
const [value, setValue] = useState(expensiveCompute())
```

因为 `expensiveCompute()` 每次渲染都会执行（即使结果只用首次）。

应该写成函数形式：

```jsx
const [value, setValue] = useState(() => expensiveCompute())
```

这叫惰性初始化：React 只在首次挂载时调用一次该函数。

---

## 更新状态的两种写法

### 直接给新值

```jsx
setCount(count + 1)
```

适合：新值不依赖“上一次状态”的复杂链式更新场景。

### 函数式更新

```jsx
setCount((prev) => prev + 1)
```

适合：新值依赖上一次状态，或你在同一事件里连续更新多次。

---

## 批量更新与“为什么 +2 没生效”

看这个例子：

```jsx
setCount(count + 1)
setCount(count + 1)
```

很多人希望它加 2，但常见情况下只会加 1。原因是：两次都基于同一个旧的 `count` 计算。

正确写法：

```jsx
setCount((prev) => prev + 1)
setCount((prev) => prev + 1)
```

这样 React 会把两次更新按顺序应用在前一次结果上。

---

## setState 是异步的吗

更准确的说法：**setState 是可被批处理的，不保证立刻反映到当前执行栈里的变量上**。

比如：

```jsx
console.log(count) // 0
setCount(1)
console.log(count) // 仍然是 0（这里还是旧渲染的值）
```

如果你需要在状态更新后做事，通常做法是用 `useEffect` 监听状态变化：

```jsx
useEffect(() => {
  // count 变化后执行
}, [count])
```

---

## 状态比较：相同值可能不会触发渲染

React 会用 `Object.is` 比较新旧 state。

- 如果 `Object.is(prev, next)` 为 true，React 可能跳过渲染
- 对对象/数组尤其重要：你必须创建新引用

---

## 对象/数组状态：不要原地改

错误示例（原地修改）：

```jsx
const [user, setUser] = useState({ name: 'A', age: 18 })

user.age += 1
setUser(user)
```

正确示例（创建新对象）：

```jsx
setUser((prev) => ({ ...prev, age: prev.age + 1 }))
```

数组同理：

```jsx
setList((prev) => [...prev, newItem])
setList((prev) => prev.filter((x) => x.id !== id))
setList((prev) => prev.map((x) => (x.id === id ? { ...x, done: true } : x)))
```

---

## setState 传入函数 vs state 本身是函数

如果你的 state 就是一个函数，你会遇到一个小坑：

```jsx
// 你想把 fn 作为 state 存起来
setValue(fn)
```

React 会把 `fn` 当成“函数式更新器”来调用。

解决：用一层包裹：

```jsx
setValue(() => fn)
```

同理初始化也一样：

```jsx
const [fn, setFn] = useState(() => someFunction)
```

---

## 多个 useState 的组织方式

### 多个独立状态

```jsx
const [name, setName] = useState('')
const [age, setAge] = useState(0)
```

优点：更新局部更简单，避免不必要的对象合并。

### 合并为一个对象

```jsx
const [form, setForm] = useState({ name: '', age: 0 })
```

优点：表单类状态集中管理。

但要注意：更新对象要手动合并（不会自动 merge）：

```jsx
setForm((prev) => ({ ...prev, name: 'B' }))
```

---

## 何时考虑 useReducer 而不是 useState

当你发现出现这些信号时，可以考虑 `useReducer`：

- 状态字段很多，更新逻辑分散到各处
- 同一交互会触发多个字段协同更新
- 更新规则复杂，想更可预测、更可测试

`useState` 适合“简单状态”，`useReducer` 适合“复杂状态机”。

---

## 常见误区清单

- 把 state 当普通变量直接修改（尤其对象/数组）
- 连续更新依赖旧值却不用函数式更新
- 以为 setState 立刻改变当前变量
- 初始值写成昂贵函数调用导致每次渲染都计算
- 把函数当 state 存时忘了包一层

---

## 记忆模型

你可以用下面这个心智模型：

- 每次渲染：组件函数执行一次，拿到“当前那一帧”的 state
- 调用 setState：提交更新请求
- React 处理更新：决定何时重新渲染
- 重新渲染：函数再执行一次，读到新的 state，UI 更新
