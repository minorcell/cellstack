---
title: '闭包陷阱：为什么你的 Hooks 总是拿到旧的值？'
description: '从“为什么 useEffect / setInterval / 事件回调里总拿到旧 state”这个高频 Bug 出发，讲清渲染快照（snapshot）+ 闭包捕获的根因；系统对比 4 种解决方案：依赖数组、函数式更新、useRef、事件回调模式，并给出选择准则'
date: 2025-12-07
order: 7
---

> 这是 Hooks 时代最经典、也最“气人”的 bug：
>
> - `useEffect` 里打印的永远是旧值
> - `setInterval` 一直用初始 state
> - 事件回调里拿到的 props/state “滞后”
>
> 你可能会怀疑：React 是不是没更新？Hooks 是不是有坑？  
> 其实问题不在 Hooks，而在 JavaScript 的一个基础特性：**闭包**，叠加 React 的一个核心模型：**每次渲染都是快照（snapshot）**。
>
> 这一篇我们把这件事讲到“你能推理出来”的程度：  
> 看到旧值，你就知道它来自哪一次渲染；  
> 知道来源，你就能选对解决方案。

---

## 0. 先给你一句总纲：闭包拿旧值不是“读错了”，而是“你捕获的是旧快照”

在函数组件中：

- 组件函数每次执行 = 一次渲染
- 这次渲染中的 props/state 是固定的快照
- 你在这次渲染里创建的函数（回调）会**闭包捕获**这份快照

所以当你把这个函数交给：

- `setInterval`
- `addEventListener`
- Promise/异步回调
- 某个只初始化一次的 effect

它就会持续引用那次渲染的变量。

**不是 React 不更新，而是你手里的函数没更新。**

---

## 1. 复现：为什么 setInterval 永远打印 0？

```jsx
function Demo() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => {
      console.log(count)
      setCount(count + 1)
    }, 1000)

    return () => clearInterval(id)
  }, [])

  return <div>{count}</div>
}
```

你会看到：

- `console.log(count)` 永远是 0（或一直滞后）
- `setCount(count + 1)` 也可能只把它加到 1 就停

### 1.1 发生了什么？

关键点有两个：

1. `useEffect(..., [])` 只在首次渲染后执行一次
2. interval 回调闭包捕获的是“首次渲染”的 `count = 0`

之后 `count` 在 UI 上更新了，但：

- effect 没重跑
- interval 回调函数也没被替换
- 闭包仍然指向旧快照

---

## 2. 闭包陷阱的本质：三件事同时成立就会中招

你可以用一个“判定公式”快速识别：

只要同时满足：

1. 你在某次渲染里创建了一个回调函数
2. 这个回调在未来某个时刻执行（异步/订阅/计时器/事件）
3. 这个回调使用了 props/state 这类渲染变量

就可能出现 **stale closure（过期闭包）**。

---

## 3. 解决方案总览：4 条路，选对一条就行

我们先列答案，再讲选择：

1. **把变量放进依赖数组**（让 effect 重建回调）
2. **用函数式更新**（让更新不依赖闭包里的旧 state）
3. **用 useRef 保存最新值**（让回调读 ref 而不是读快照）
4. **把“事件回调”做成稳定函数 + 内部读取最新值**（一种工程化模式）

---

## 4. 方案 1：依赖数组（让 effect 绑定到变化，自动重建）

把 `count` 加进依赖：

```jsx
React.useEffect(() => {
  const id = setInterval(() => {
    console.log(count)
    setCount(count + 1)
  }, 1000)

  return () => clearInterval(id)
}, [count])
```

### 优点

- 语义清晰：这个 effect 依赖 count
- 闭包永远捕获最新 count

### 缺点（很关键）

- 每次 count 变化都会：
  - 清理旧 interval
  - 重新创建新 interval

- 对一些“订阅类副作用”来说，频繁重建可能不理想（成本高、抖动、丢事件）

**适用场景：**

- effect 本来就应该随着依赖变化而重建
- 重建成本可接受

---

## 5. 方案 2：函数式更新（最常用，也最推荐的“解旧值”方式）

如果你的目的只是“在旧值基础上更新”，不要读闭包里的 `count`，而是让 React 把最新值交给你：

```jsx
setCount((c) => c + 1)
```

配合 interval：

```jsx
React.useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1)
  }, 1000)

  return () => clearInterval(id)
}, [])
```

### 为什么这能解决？

因为更新函数 `c => c + 1`：

- 不依赖外层闭包里的 count
- React 在执行更新时，会传入“当时最新的 state”

**适用场景：**

- 你需要基于旧 state 计算新 state（加一、累加、push、toggle）
- 你不关心回调里读取最新值做别的逻辑（只关心更新）

---

## 6. 方案 3：useRef 保存最新值（订阅不重建，但读取永远最新）

当你既想：

- effect 只执行一次（不频繁重建订阅/计时器）
- 回调里又要读到最新 state/props

就用 ref：

```jsx
function Demo() {
  const [count, setCount] = React.useState(0)
  const countRef = React.useRef(count)

  React.useEffect(() => {
    countRef.current = count
  }, [count])

  React.useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current) // 永远最新
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return <div>{count}</div>
}
```

### 优点

- 订阅/计时器只建立一次
- 回调读到的永远最新

### 缺点

- ref 更新不会触发渲染（它是“逃生通道”）
- 过度使用 ref 会让数据流变得不透明（可维护性下降）

**适用场景：**

- WebSocket / event emitter / interval 这类“长期存在的外部系统”
- 不希望频繁重建订阅
- 回调需要读最新值做逻辑判断

---

## 7. 方案 4：稳定回调模式（把“最新读取”封装起来，工程里很常用）

很多团队会把“读取最新值”封装成一个可复用的 hook，例如：

- `useLatest`：把值放到 ref 里
- `useEvent` / “稳定事件回调”：返回一个引用稳定但内部总读最新的函数

概念上长这样：

```jsx
function useLatest(value) {
  const ref = React.useRef(value)
  React.useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}

function useStableCallback(fn) {
  const fnRef = useLatest(fn)
  return React.useCallback((...args) => fnRef.current(...args), [])
}
```

使用：

```jsx
const onMessage = useStableCallback((msg) => {
  // 这里读取到的 state/props 永远是最新的（通过 fnRef 间接获取）
})
```

> 注意：上面是一种“模式示意”。是否采用、如何实现要结合团队规范与 React 版本（并发语义）谨慎评估。

**适用场景：**

- 你有大量事件回调/订阅回调
- 不想每次依赖变化都换函数引用（避免 re-subscribe、避免子组件重渲染）
- 希望把“防 stale closure”变成一种通用设施

---

## 8. 如何选择？给你一个实战决策树

你可以按下面 3 问快速选方案：

### Q1：我只是基于旧 state 计算新 state 吗？

- 是 → **函数式更新**（方案 2）
- 否 → 看 Q2

### Q2：这个 effect/订阅需要随着某些值变化而重建吗？

- 需要 → **依赖数组**（方案 1）
- 不需要 → 看 Q3

### Q3：我需要回调里读取最新 state/props 吗？

- 需要 → **useRef / 稳定回调模式**（方案 3 / 4）
- 不需要 → 维持现状或用函数式更新即可

---

## 9. 常见误区：为了解旧值，删依赖数组（这是把症状藏起来）

你可能见过这样的“修复”：

```jsx
// eslint 警告依赖不全
// 于是你把依赖数组改成 []
useEffect(() => {
  doSomething(count)
}, [])
```

这通常会把问题变得更隐蔽：

- effect 绑定了旧快照
- 逻辑悄悄失效
- bug 可能只在某些状态组合出现

正确做法是：

- 要么补齐依赖
- 要么改变代码结构（函数式更新/ref）
- 要么把 effect 拆小，明确每段逻辑的依赖

---

## 10. 本文小结：把“旧值”当成一个信号

当你在 Hooks 里看到“旧值”，不要慌，把它当成提示：

- “这段代码运行在旧渲染的快照里”
- “我创建的回调没随着状态变化而更新”
- “我需要重新绑定 effect，或者不要依赖闭包”

你需要记住的三句话：

1. **每次渲染是快照**
2. **闭包会捕获快照**
3. **解决 stale closure 的本质是：让回调读到“最新来源”**（依赖重建 / 函数式更新 / ref）
