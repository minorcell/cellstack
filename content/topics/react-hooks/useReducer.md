---
title: 'useReducer'
description: '从“复杂状态用 reducer 管理”到 action 设计、不可变更新、与 useState/useContext 的组合实践'
date: 2026-01-15
order: 7
---

## 先用一句话理解 useReducer

`useReducer` 用来以“**reducer + action**”的方式管理状态：你派发 action，reducer 根据旧状态计算新状态，让复杂更新逻辑更集中、更可预测。

---

## 为什么会需要 useReducer

`useState` 很适合简单状态，但当你遇到这些信号时，`useReducer` 往往更舒服：

- 状态字段多、更新分散，靠 `setXxx` 很难读
- 多个字段要一起变（一次交互触发多处变化）
- 更新规则复杂，需要更强的可维护性/可测试性
- 你想把“如何更新”从组件逻辑里抽出去

一句话：**状态越像“状态机”，越适合 reducer。**

---

## 最基本用法

```jsx
import { useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'inc':
      return { ...state, count: state.count + 1 }
    case 'dec':
      return { ...state, count: state.count - 1 }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  return (
    <>
      <div>{state.count}</div>
      <button onClick={() => dispatch({ type: 'dec' })}>-</button>
      <button onClick={() => dispatch({ type: 'inc' })}>+</button>
    </>
  )
}
```

你会得到两个东西：

- `state`：当前状态
- `dispatch(action)`：派发动作，触发 reducer 计算新状态并重新渲染

---

## reducer 是什么

reducer 是一个纯函数：

```js
nextState = reducer(prevState, action)
```

要求（强烈建议）：

- 不做副作用（不发请求、不操作 DOM、不读写本地存储）
- 不修改入参（不要直接改 prevState）
- 同样输入得到同样输出（可预测）

---

## action 怎么设计更好用

### 最简单：字符串 type

```js
dispatch({ type: 'toggle' })
```

### 带 payload

```js
dispatch({ type: 'setName', payload: 'Alice' })
```

### 多字段 payload

```js
dispatch({ type: 'updateForm', payload: { name: 'A', age: 18 } })
```

经验法则：

- type 用动词：`add/remove/toggle/set/update`
- payload 只携带 reducer 需要的最小信息

---

## 不可变更新：必须返回新对象/新数组

错误：原地修改

```js
state.items.push(action.payload)
return state
```

正确：创建新引用

```js
return { ...state, items: [...state.items, action.payload] }
```

因为 React 判断是否需要更新依赖“引用变化”，原地改会导致很多问题（包括 memo、effect、调试难度）。

---

## useReducer 与 useState 的关键差异

- `useState`：你直接给新值 / 或给更新函数
- `useReducer`：你统一通过 `dispatch(action)` 来表达“发生了什么”，由 reducer 决定“状态如何变”

对应关系可以这样理解：

- `setCount(c => c + 1)` 约等于 `dispatch({ type: "inc" })`
- 但 reducer 可以把一堆相关更新集中起来处理

---

## 惰性初始化：init 函数

当初始 state 计算成本高，或者需要从 props 推导初始值：

```jsx
function init(initialCount) {
  return { count: initialCount, history: [] }
}

const [state, dispatch] = useReducer(reducer, 10, init)
```

第三个参数 `init` 只会在首次挂载时调用一次。

---

## 把副作用放哪里

reducer 应该纯，那么请求/订阅这种副作用放哪里？

常见模式：

- 在事件处理里 dispatch（同步）
- 用 `useEffect` 监听 state 或某些 action 结果来做副作用（异步）

示例：提交表单后发请求

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'submit':
      return { ...state, submitting: true, error: null }
    case 'success':
      return { ...state, submitting: false, data: action.payload }
    case 'error':
      return { ...state, submitting: false, error: action.payload }
    default:
      return state
  }
}

function Form() {
  const [state, dispatch] = useReducer(reducer, {
    submitting: false,
    data: null,
    error: null,
  })

  const onSubmit = async () => {
    dispatch({ type: 'submit' })
    try {
      const res = await fetch('/api', { method: 'POST' })
      dispatch({ type: 'success', payload: await res.json() })
    } catch (e) {
      dispatch({ type: 'error', payload: String(e) })
    }
  }

  return (
    <button onClick={onSubmit} disabled={state.submitting}>
      {state.submitting ? 'submitting...' : 'submit'}
    </button>
  )
}
```

---

## 与 useContext 组合：轻量“全局状态”

典型写法：Context 提供 `{state, dispatch}`

```jsx
import { createContext, useContext, useMemo, useReducer } from 'react'

const StoreContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, todos: [...state.todos, action.text] }
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { todos: [] })

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
```

注意点：

- `value` 用 `useMemo`，避免每次渲染都新对象导致消费者全重渲染
- state 变化仍会让所有 useContext 的组件更新；想更细粒度需要拆 Context 或用带 selector 的方案

---

## 常见误区清单

- reducer 里做副作用（请求/订阅/随机数/读写 storage）
- 原地修改 state（push/splice/直接赋值）
- action 设计随意导致 reducer 变成“巨石函数”难维护
- 把所有全局状态都塞进一个 context，任何变化都导致全体重渲染
- 以为 useReducer 一定更快（它更偏向结构化与可维护性）

---

## 记忆模型

- `dispatch` 表达“发生了什么”
- `reducer` 决定“状态怎么变”
- reducer 要纯、更新要不可变
- 复杂状态用 reducer，让逻辑集中、可预测、易测试

---

## 最小练习题

实现一个 Todo reducer，支持：

- 添加：`{ type: "add", text }`
- 切换完成：`{ type: "toggle", id }`
- 删除：`{ type: "remove", id }`

数据结构：

```js
{
  todos: [{ id, text, done }]
}
```

参考 reducer：

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: Date.now(), text: action.text, done: false },
        ],
      }
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t,
        ),
      }
    case 'remove':
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.id),
      }
    default:
      return state
  }
}
```
