---
title: '不止是状态管理：useReducer 与 useContext 的协作之道'
description: '从“跨层传参太痛、状态越来越乱、多个组件要协同更新”这些真实场景出发，讲清 useReducer 的可预测更新模型、Context 的作用域与性能特性，并给出一套可落地的组合范式：Reducer 驱动 + 分层 Context + 选择性订阅的优化策略'
date: 2025-12-11
order: 9
---

> 当你项目从“几个页面”长到“几十个组件”后，很多问题会一起涌上来：
>
> - props 一路往下传，传到第 5 层你已经不知道这玩意儿从哪来的
> - 多个组件要协同更新一份状态，改动点越来越多，逻辑越来越散
> - 你不想上 Redux（太重），但也不想全靠 useState（太乱）
>
> 这时候最实用的一套中间解是：  
> **useReducer 管更新规则，useContext 管共享范围**。
>
> 这篇我们把它讲成一套可落地的架构范式，并顺手把 Context 的性能坑讲透。

---

## 0. 先给结论：useReducer 解决“怎么改”，Context 解决“谁能用”

你可以把它们的职责分得很清楚：

- `useReducer`：把状态变化收口到一个纯函数里（可预测、可测试）
- `useContext`：把这份状态（以及 dispatch）在组件树某个范围内共享

所以它们组合起来就是：

> 在某个 Provider 范围内，用 reducer 统一管理状态与更新。

---

## 1. 为什么复杂状态更适合 useReducer？因为它让变化可推理

### 1.1 useState 在复杂场景里的典型“失控”表现

当状态拆成一堆 useState：

- 更新逻辑分散在各个 handler/effect 里
- “A 更新会影响 B” 的因果关系很难追
- 很容易出现“先后顺序依赖”的 bug

useReducer 提供一种“状态机化”的表达：

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, items: [...state.items, action.payload] }
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    default:
      return state
  }
}
```

它的优势是：

- 更新入口统一：`dispatch(action)`
- 变化集中：只有 reducer 能决定新 state
- 纯函数易测试：输入 state + action => 输出 nextState

---

## 2. Context 到底解决什么？——跨层共享，但要明确“范围”

Context 常见用途：

- 主题 theme、国际化 i18n
- 用户信息 user、权限 auth
- 全局通知 toast、modal 管理
- 中型页面模块的共享状态（列表筛选、编辑器状态等）

关键点是：

> Context 不是“全局”，它是“树上的一个范围”。

Provider 放在哪，谁能消费（useContext）就由树结构决定。

这也意味着一个好实践：

- **不要把 Provider 放得太高**
- **只在需要共享的模块范围内提供**

---

## 3. 组合范式：Reducer + Context 的最小可用模板（中型项目很好用）

### 3.1 创建 Context（分成 State 与 Dispatch 两个）

为什么要分两个？后面性能部分你会懂。

```jsx
const StateContext = React.createContext(null)
const DispatchContext = React.createContext(null)

function AppProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  )
}

function useAppState() {
  const ctx = React.useContext(StateContext)
  if (ctx === null)
    throw new Error('useAppState must be used within AppProvider')
  return ctx
}

function useAppDispatch() {
  const ctx = React.useContext(DispatchContext)
  if (ctx === null)
    throw new Error('useAppDispatch must be used within AppProvider')
  return ctx
}
```

使用：

```jsx
function Toolbar() {
  const dispatch = useAppDispatch();
  return <button onClick={() => dispatch({ type: "add", payload: ... })}>Add</button>;
}

function List() {
  const state = useAppState();
  return state.items.map(...);
}
```

### 3.2 为什么推荐“State/Dispatch 分开”？

因为 dispatch 本身是稳定的（同一个函数引用），拆开后：

- 只需要 dispatch 的组件不会因为 state 变化而重渲染
- 能显著减少 Context 触发的无效更新

---

## 4. Context 的性能真相：Provider 的 value 一变，所有消费者都会重渲染

这是 Context 的核心特性（也是坑）：

> 当 Provider 的 `value` 引用变化时，所有 `useContext` 该 Context 的组件都会 re-render。

所以如果你把一个大对象 state 放进 Context：

- state 每次更新都会变引用（不可变更新）
- 所有消费 state 的组件都会重渲染
- 哪怕它们只用到了 state 的某个小字段

这不是 React “做得不好”，而是 Context 的设计决定的。

---

## 5. 三种常见优化策略（从易到难）

### 5.1 策略 1：拆 Context（最推荐，最简单）

把大 state 拆成多个更小的 context：

- `UserContext`
- `ThemeContext`
- `TodoStateContext`
- `TodoDispatchContext`
- `FilterContext`

原则：

> 让“变化频率高”的部分不要影响“变化频率低”的部分。

### 5.2 策略 2：Provider 下沉（缩小影响范围）

不要把 Provider 放到 App 根上，能放模块级就放模块级：

```jsx
<Page>
  <TodoProvider>
    <TodoList />
    <TodoToolbar />
  </TodoProvider>
</Page>
```

这样 todo 更新不会影响整个应用。

### 5.3 策略 3：选择性消费（selector 思路）

Context 原生不支持 selector（即只订阅某个字段），但你可以通过：

- 拆 context（本质是 selector 的替代）
- 或引入专门库（如 use-context-selector 等）
- 或上 Zustand/Redux（它们天生支持 selector）

当你发现：

- context 拆到很多个仍不够
- 或页面很大、更新频繁、性能要求高

这时就该认真评估使用状态库了。

---

## 6. 一个常见误区：把“计算派生”也塞进 reducer

Reducer 应该做：

- 状态转移（state transition）
- 保持纯函数与可预测

不建议在 reducer 里做：

- 重度计算
- 非确定性逻辑（读取时间、随机数、外部 IO）
- 依赖环境的行为

派生值更适合：

- 渲染期间计算
- `useMemo`
- 或在 selector 层处理

---

## 7. 实战范式：用 reducer 管业务流程（loading/error/status）

例如一个典型请求流程，不要散在多个 useState 里：

```jsx
const initialState = { status: 'idle', data: null, error: null }

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { status: 'loading', data: null, error: null }
    case 'success':
      return { status: 'success', data: action.data, error: null }
    case 'error':
      return { status: 'error', data: null, error: action.error }
    default:
      return state
  }
}
```

组件只关心：

- 现在 status 是什么
- 根据 status 渲染不同 UI
- dispatch 触发状态转移

这样逻辑会非常稳定。

---

## 8. 什么时候这套方案就够了？什么时候该上状态库？

### 8.1 这套方案很适合

- 单页或单模块的中型复杂度
- 共享范围可控（模块级 Provider）
- 更新频率适中
- 团队想保持原生 React 简洁

### 8.2 考虑上 Zustand/Redux/Recoil 的信号

- 需要跨页面/跨路由共享大量状态
- 需要 selector、devtools、时间旅行、持久化等能力
- Context 拆到很多层仍然导致性能问题
- 业务状态多且更新频繁（实时协作、复杂编辑器等）

---

## 9. 本文小结：一套可落地的“中型状态管理”模板

你只需要记住这 5 点：

1. `useReducer`：统一更新入口，让变化可预测、可测试
2. `useContext`：把 state/dispatch 在某个范围共享
3. Provider 范围要克制：能模块级就别全局
4. State/Dispatch 拆 Context：降低无效重渲染
5. 真正需要 selector 时，拆 context 到极限仍不够，再考虑状态库
