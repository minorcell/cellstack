---
title: '自定义 Hooks 的艺术：逻辑复用的最优解'
description: '从“同一套副作用/请求/订阅逻辑在多个组件里重复粘贴”这个痛点出发，讲清自定义 Hooks 的设计边界、API 形状、依赖与闭包的正确处理方式，并给出 4 类高复用范式：数据请求、订阅监听、表单状态、缓存与派生'
date: 2025-12-09
order: 8
---

> 你写 React 写到一定阶段，一定会出现这些现象：
>
> - 组件越来越像“业务胶水”，一半是 UI，一半是各种请求/订阅/状态同步
> - 同一套逻辑在不同页面复制粘贴，修一个 bug 得改 N 份
> - 把逻辑抽成工具函数又不对，因为里面需要 state、effect、ref
>
> 自定义 Hooks 就是 React 给出的“正确抽象层”：  
> **把可复用的状态逻辑与副作用封装起来**，让组件重新变回“专注渲染”的函数。
>
> 但自定义 hook 也很容易写成黑盒：依赖写不清、闭包旧值、重复请求、难测试。  
> 这篇会给你一套可落地的设计准则与常见范式。

---

## 0. 先给结论：自定义 Hook 的本质是“把组件的一部分渲染逻辑抽出来”

很多人把 hook 当成“工具函数”，结果写着写着就开始：

- 在 hook 里偷偷操作 DOM
- 依赖数组乱写
- 返回一堆不稳定的函数引用
- 组件拿到的是“不可推理”的行为

你要记住：

> 自定义 Hook 不是魔法，它只是把 `useState/useEffect/...` 的组合封装起来。  
> 它仍然遵循“每次渲染是快照”的规则，也仍然会受闭包与依赖影响。

---

## 1. 什么时候该抽 Hook？什么时候不该抽？

### 1.1 适合抽成 Hook 的信号（出现任意一个就该考虑）

- 多个组件重复相同的状态 + 副作用逻辑（请求、订阅、事件监听）
- 组件里出现“非 UI 的流程控制”（loading/error/重试/缓存/取消）
- 需要把一套逻辑组合复用（比如：分页 + 搜索 + 防抖 + 缓存）

### 1.2 不适合抽成 Hook 的情况

- 纯粹的计算函数（不需要 hooks）→ 直接写工具函数即可
- 只在一个地方用一次、逻辑很短 → 抽了反而降低可读性
- Hook 内部依赖特定组件结构（比如强耦合某个 DOM）→ 可能更适合组件化而不是 hook

---

## 2. Hook 设计三原则（写得“可推理”的关键）

### 原则 1：让依赖显式化（不要靠“猜”）

- hook 接收的参数 = 它依赖的输入
- hook 内部使用的外部变量，尽量通过参数传入

✅ 推荐：

```jsx
function useUser(userId) { ... }
```

❌ 不推荐：

```jsx
function useUser() {
  // 偷偷读取全局变量、localStorage、window.location
}
```

### 原则 2：返回值要稳定且语义清晰

- 返回对象字段命名要像“状态机”：`data/loading/error`
- 返回的 handler 尽量稳定（useCallback），避免让调用方难以优化

### 原则 3：把副作用当成“同步外部系统”，而不是“内部推导状态”

- 需要推导就用计算/派生（useMemo）
- 需要同步外部就用 effect，并保证 cleanup 正确

---

## 3. Hook API 的 4 种常见形状（你可以直接套）

### 3.1 数据请求型：`{ data, loading, error, refetch }`

最常见的业务 hook：

```jsx
function useUser(userId) {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const fetcher = React.useCallback(
    async (signal) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/user/${userId}`, { signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (e) {
        if (e.name !== 'AbortError') setError(e)
      } finally {
        setLoading(false)
      }
    },
    [userId],
  )

  React.useEffect(() => {
    const controller = new AbortController()
    fetcher(controller.signal)
    return () => controller.abort()
  }, [fetcher])

  const refetch = React.useCallback(() => {
    const controller = new AbortController()
    fetcher(controller.signal)
    return () => controller.abort()
  }, [fetcher])

  return { data, loading, error, refetch }
}
```

> 注意：这里用 `AbortController` 解决“组件卸载后 setState”的经典问题，并且依赖完全显式。

使用：

```jsx
const { data, loading, error, refetch } = useUser(id)
```

---

### 3.2 订阅监听型：`value` 或 `{ value, status }`

比如监听窗口大小、网络状态、WebSocket 消息：

```jsx
function useWindowSize() {
  const [size, setSize] = React.useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))

  React.useEffect(() => {
    const onResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}
```

关键点：

- effect 空依赖：订阅只建立一次
- cleanup 可靠：StrictMode 下也不怕

---

### 3.3 表单状态型：`{ values, errors, bind, submit }`

表单总是重复的状态管理与校验：

```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = React.useState(initialValues)
  const [errors, setErrors] = React.useState({})

  const setField = React.useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const bind = React.useCallback(
    (name) => ({
      value: values[name] ?? '',
      onChange: (e) => setField(name, e.target.value),
    }),
    [values, setField],
  )

  const submit = React.useCallback(
    (onValid) => {
      const nextErrors = validate ? validate(values) : {}
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length === 0) onValid(values)
    },
    [values, validate],
  )

  return { values, errors, setField, bind, submit }
}
```

> 这个例子刻意把 “bind” 做成返回 input props 的 helper，组件就非常干净。

---

### 3.4 缓存/派生型：`memoizedValue`

比如对大列表做过滤/排序，避免每次渲染重算：

```jsx
function useFilteredList(list, keyword) {
  return React.useMemo(() => {
    const k = keyword.trim().toLowerCase()
    if (!k) return list
    return list.filter((item) => String(item.name).toLowerCase().includes(k))
  }, [list, keyword])
}
```

关键点：

- 这是“派生”，不是“副作用”
- 不要用 effect + setState 来做派生（容易循环、容易旧值）

---

## 4. 自定义 Hook 最常见的坑：写成“黑盒”，依赖与闭包变得不可见

### 4.1 坑：hook 内部偷偷读外部变量

```jsx
function useSomething() {
  // 读 window.location、读全局 store、读某个 module 单例
}
```

问题是：

- 调用方看不到依赖，无法推理何时会变化
- 测试也很难控制环境

更推荐：

- 把变化作为参数传入
- 或把数据源通过参数注入（依赖注入）

### 4.2 坑：返回不稳定的函数，导致调用方一直重渲染

如果 hook 每次渲染都返回一个新函数：

```jsx
return { doSomething: () => {...} };
```

那调用方即使用 `React.memo` 也会失效（props 引用变化）。

✅ 做法：用 `useCallback` 稳定返回的 handler

---

## 5. 一个非常实用的规则：Hook 里“可变”只放在 state/ref；“可预测”放在参数/返回值

- 需要触发渲染 → state
- 不需要触发渲染但要跨渲染保存 → ref
- 能从输入计算出来 → memo/计算
- 同步外部系统 → effect + cleanup

按这个规则写，hook 会自然变得稳定、可维护。

---

## 6. Hook 的“组合”才是威力：把积木拼成业务能力

你可以把 hook 当积木：

- `useDebounce(keyword)`
- `useFilteredList(list, debouncedKeyword)`
- `usePagination(filteredList)`
- `useAsyncRequest(params)`

组合后的组件代码会很像“声明式配置”：

```jsx
const debounced = useDebounce(keyword, 300)
const filtered = useFilteredList(list, debounced)
const page = usePagination(filtered, { pageSize: 50 })
```

这就是 hook 让业务逻辑“可组装”的价值。

---

## 7. 本文小结：写好自定义 Hooks 的 5 条准则

1. 抽 hook 的信号：重复的状态 + 副作用流程
2. 依赖显式：输入参数就是依赖，别偷偷读外部
3. 返回值语义清晰：`data/loading/error/handlers`
4. handler 引用稳定：useCallback，别让调用方难优化
5. 派生用 memo，外部同步用 effect，cleanup 要可靠
