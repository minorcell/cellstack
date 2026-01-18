---
title: 'useContext'
description: '从“跨层传参”痛点出发，讲清 Context 的使用方式、Provider 范围、性能特性与常见坑'
date: 2026-01-18
order: 3
---

## 先用一句话理解 useContext

`useContext` 用来在组件里读取某个 Context 的当前值，从而实现“跨层级共享数据”，避免层层 props 传递。

---

## 为什么需要 Context

当数据需要从很上层传到很下层时，通常会出现 props drilling：

```jsx
<App>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserCard user={user} />
```

中间层组件可能根本不用 `user`，但不得不一层层转发。

Context 提供一种“组件树范围内的隐式依赖”：

- 上层用 `Provider` 提供值
- 任意下层用 `useContext` 读取值

---

## 最基本用法：创建、提供、消费

### 创建 Context

```jsx
import { createContext } from 'react'

const ThemeContext = createContext('light')
```

`createContext(defaultValue)` 的 defaultValue 只在**没有 Provider 包裹**时生效。

### 提供值：Provider

```jsx
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  )
}
```

### 读取值：useContext

```jsx
import { useContext } from 'react'

function Page() {
  const theme = useContext(ThemeContext)
  return <div data-theme={theme}>...</div>
}
```

---

## Provider 的作用范围

Context 值按“最近的 Provider”决定：

```jsx
<ThemeContext.Provider value="dark">
  <A /> // dark
  <ThemeContext.Provider value="light">
    <B /> // light
  </ThemeContext.Provider>
  <C /> // dark
</ThemeContext.Provider>
```

---

## defaultValue 的真实意义

`createContext("light")` 的 `"light"` 不是“初始值”，更像是“兜底值”。

常见建议：

- 如果你希望强制必须在 Provider 下使用，可以把 defaultValue 设为 `null` 并在自定义 Hook 里报错。

---

## 推荐写法：自定义 Hook + 强约束

```jsx
import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const value = { user: { id: 1, name: 'A' } }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

用的时候更干净：

```jsx
function Profile() {
  const { user } = useAuth()
  return <div>{user.name}</div>
}
```

---

## Context 更新会导致哪些组件重渲染

关键规则：

- **所有使用 `useContext(SomeContext)` 的组件**，只要该 Context 的 `value` 发生变化（引用变化也算），都会重新渲染。

即使你只用到了其中一个字段，也会重渲染。

---

## 性能与“为什么我什么都没改也在重渲染”

最常见原因：Provider 的 `value` 每次渲染都创建新对象。

```jsx
<AuthContext.Provider value={{ user, logout }}>
```

每次渲染都会生成新的 `{}`，导致 context value 变化，从而触发所有消费者重渲染。

解决：用 `useMemo` 稳定 value 引用（前提是依赖不变）。

```jsx
const value = useMemo(() => ({ user, logout }), [user, logout])

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
```

---

## Context 适合放什么、不适合放什么

适合：

- 主题（theme）、语言（i18n）
- 当前登录用户、权限、feature flags
- 全局配置、依赖注入（API client、logger）
- “组件树范围内共享”的数据（注意范围：Provider 包到哪里）

不太适合：

- 高频变化的状态（比如拖拽坐标、输入框每次输入）
  - 因为会让大量消费者频繁重渲染

这类更适合局部 state、状态库（带选择器）、或拆分多个 Context。

---

## 拆分 Context：减少无关重渲染

不要把“所有东西”塞一个 Context：

```jsx
value={{ user, theme, locale, notifications, ... }}
```

更好的方式：

- `UserContext`
- `ThemeContext`
- `LocaleContext`

让变化更局部，影响更小。

---

## 典型模式：Context + useReducer 做轻量全局状态

```jsx
const TodosContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, action.text]
    default:
      return state
  }
}

function TodosProvider({ children }) {
  const [todos, dispatch] = useReducer(reducer, [])
  const value = useMemo(() => ({ todos, dispatch }), [todos])
  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
}

function useTodos() {
  const ctx = useContext(TodosContext)
  if (!ctx) throw new Error('useTodos must be used within TodosProvider')
  return ctx
}
```

---

## 常见误区清单

- 误把 defaultValue 当“初始化 state”
- Provider value 直接写对象/函数导致引用每次变化，消费者全重渲染
- 一个 Context 塞太多东西，任何字段变化都触发所有消费者更新
- 在 Provider 外调用 useContext，拿到兜底值却没意识到（建议强约束抛错）
- 期望 Context 像 props 一样“精准更新某个字段”（Context 没有内建选择器）

---

## 记忆模型

- Context 是“广播”：Provider 值变化会通知所有订阅者（useContext 的组件）
- Provider 的 value 变化判断是“引用层面”的（Object.is）
- 想控制影响范围：拆 Context + useMemo 稳定引用 + 避免高频变化放 Context

---

## 最小练习题

实现一个 ThemeProvider，能在 `light/dark` 之间切换，任意子组件都可以读取 theme 并触发切换。

```jsx
// TODO: createContext + ThemeProvider + useTheme
```

参考实现：

```jsx
import { createContext, useContext, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const value = useMemo(() => ({ theme, toggle }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```
