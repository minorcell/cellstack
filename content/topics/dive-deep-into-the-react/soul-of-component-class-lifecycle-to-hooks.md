---
title: '组件的灵魂：从 Class 生命周期到 Hooks 的思维转变'
description: '从“useEffect 到底什么时候执行、为什么会执行两次、cleanup 何时触发”这些高频困惑出发，把 Class 生命周期映射到 Hooks 的副作用模型，建立可推理的心智框架'
date: 2025-11-29
order: 3
---

> 如果你从 Class 时代走来，大概率会被这几件事折磨过：
>
> - `useEffect` 到底相当于哪个生命周期？`componentDidMount` 还是 `componentDidUpdate`？
> - 为什么依赖数组写错了就会“无限循环”？
> - 为什么开发环境下 effect 会执行两次？（我明明只写了一次！）
> - cleanup 到底什么时候跑？卸载？还是每次更新前？
>
> 本文会用一种“可推理”的方式，把你熟悉的 Class 生命周期拆成两个维度：  
> **渲染（render）**与**副作用（effect）**，并把它们精确映射到 Hooks。

---

## 0. 先抛结论：Hooks 不是把生命周期换了个 API，而是换了一套模型

Class 生命周期的视角是：

> “组件从出生到死亡，会经过一系列阶段（mount/update/unmount）。”

Hooks（尤其是 `useEffect`）的视角更像是：

> “每次渲染之后，根据依赖变化，决定要不要同步外部世界；必要时先清理旧的同步，再建立新的同步。”

它们关注点不同：

- Class：关注**阶段**
- Hooks：关注**渲染后的同步规则**

所以你会觉得 `useEffect` “不像任何一个生命周期”，因为它本来就不是生命周期 API。

---

## 1. 两条铁律：理解 Hooks 之前先背下来

### 铁律 1：每次渲染都是一次“快照”

组件函数每执行一次，里面拿到的 props/state 都是那次渲染的快照。

```jsx
function Demo({ value }) {
  // 这次 render 的 value 就固定了
  // 下一次 render 才会拿到新 value
}
```

### 铁律 2：Effect 是“渲染之后”才执行的同步动作

`useEffect` 的回调不会在 render 期间跑，而是在 React 提交（commit）之后跑。

> render：算出 UI 应该长什么样（纯计算）
> commit：把变化真正提交到宿主环境（DOM）
> effect：在 commit 之后做副作用（同步外部世界）

把这两个铁律记牢，你就能推理 90% 问题。

---

## 2. 生命周期 vs Hooks：最常用映射表（但别死记）

先给你一张“常用对照表”，但后面我们会解释为什么它不够：

| Class 生命周期           | Hooks 常见对应                           | 关键区别                                       |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| componentDidMount        | useEffect(() => {}, [])                  | effect 在 commit 后执行                        |
| componentDidUpdate       | useEffect(() => {}, [deps])              | 根据 deps 决定是否执行                         |
| componentWillUnmount     | useEffect(() => () => {}, []) 的 cleanup | cleanup 不仅在卸载，也会在下一次 effect 前执行 |
| shouldComponentUpdate    | React.memo / useMemo / useCallback       | 依赖浅比较与引用稳定性                         |
| getDerivedStateFromProps | 少用；改为派生计算或 useMemo             | Hooks 更鼓励“计算而非复制”                     |
| componentDidCatch        | ErrorBoundary（仍是 Class）              | 目前主流仍靠 Class                             |

重点：**cleanup 的语义**跟 `componentWillUnmount` 不是完全一致的。

---

## 3. useEffect 的真实语义：同步外部系统

官方更推荐你这样理解 effect：

> 当组件渲染后，需要把 React 的状态同步到外部系统（订阅、计时器、DOM 操作、请求、埋点），就用 effect。

外部系统包括但不限于：

- 事件订阅（WebSocket、EventEmitter）
- 定时器（setInterval / setTimeout）
- DOM API（聚焦、测量）
- 浏览器 API（localStorage、history）
- 网络请求（fetch + abort）
- 埋点、日志

一句话：**effect 是“React 之外的世界”**。

---

## 4. 关键推理：Effect 何时执行？clean up 何时执行？

把 effect 看成一个“建立连接/解除连接”的过程：

```jsx
useEffect(() => {
  // 建立连接（subscribe / start / connect）
  return () => {
    // 解除连接（unsubscribe / stop / disconnect）
  }
}, [deps])
```

### 4.1 执行顺序（你可以当成固定规则）

当 deps 发生变化时，React 会：

1. **先执行上一次 effect 的 cleanup**
2. **再执行这一次新的 effect**

当组件卸载时，也会执行一次 cleanup（如果存在）。

所以 cleanup 的语义更准确是：

> 清理“上一次渲染建立的副作用”。

而不是只等到卸载。

---

## 5. 依赖数组：它不是“优化选项”，而是语义声明

很多人把依赖数组当成性能优化：“写了就少跑”。

更准确的理解是：

> 依赖数组是在声明：这个 effect 与哪些渲染变量绑定。
> 当这些变量变了，你必须重新同步外部世界。

### 5.1 三种典型写法，对应三种语义

#### A) 不写依赖数组：每次渲染后都同步

```jsx
useEffect(() => {
  console.log('每次 render 后都执行')
})
```

语义：每次 UI 变化都要重新同步外部系统。

#### B) 空依赖数组：只在首次挂载时同步一次（以及卸载清理）

```jsx
useEffect(() => {
  console.log('只在 mount 后执行')
  return () => console.log('unmount 时清理')
}, [])
```

语义：这个外部系统连接只需要建立一次。

#### C) 有依赖：依赖变了才重新同步

```jsx
useEffect(() => {
  console.log('当 id 变化时重新同步')
}, [id])
```

语义：effect 与 `id` 绑定，`id` 换了就重新建立连接。

---

## 6. 高频坑 1：闭包拿到旧值（“为什么我总是打印旧 state？”）

看这个例子：

```jsx
function Timer() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => {
      console.log(count) // 经常一直是 0
      setCount(count + 1)
    }, 1000)
    return () => clearInterval(id)
  }, []) // 我只想启动一次

  return <div>{count}</div>
}
```

为什么 `count` 可能一直是 0？

因为：

- `useEffect(..., [])` 只会在首次渲染后运行一次
- interval 回调闭包捕获的是**首次渲染的 count 快照**
- 后面 count 更新了，但这个 effect 没重建，闭包也就不会更新

✅ 正确写法 1：函数式更新（最推荐）

```jsx
setCount((c) => c + 1)
```

✅ 正确写法 2：把 count 放进依赖（但会重建 interval）

```jsx
useEffect(() => { ... }, [count]);
```

✅ 正确写法 3：用 ref 保存最新值（适合不想重建订阅）

```jsx
const countRef = useRef(count)
useEffect(() => {
  countRef.current = count
}, [count])
```

这个“闭包陷阱”我们会在下一阶段 Hooks 专栏再深入挖，但现在你至少知道它从哪来：**渲染快照 + effect 不重建**。

---

## 7. 高频坑 2：无限循环（“我一 setState 就炸了”）

```jsx
useEffect(() => {
  setCount(count + 1)
}, [count])
```

逻辑是：

- count 变 -> effect 执行
- effect 里 setCount -> count 又变
- count 变 -> effect 又执行
- ……

解决方式不是“少写依赖”，而是问清楚语义：

- 你到底想同步什么外部系统？
- 你是不是把“计算状态”放进 effect 了？

如果你的新状态是由旧状态“可计算”得到的，优先用：

- 渲染期间计算（派生值）
- `useMemo`
- 或者在事件处理里更新

effect 应该用于“同步外部系统”，而不是“内部状态推导”。

---

## 8. 高频坑 3：为什么开发环境下 effect 会执行两次？

你可能在 React 18 的开发环境里看到：

- `useEffect` mount 执行两次
- cleanup 也跑一次
- 然后又执行一次

这通常发生在 **StrictMode** 下。

StrictMode 在开发环境会做一些“额外检查”，其中之一是：

> 通过模拟“挂载 -> 卸载 -> 再挂载”，来帮助你发现副作用是否可重复、是否正确清理。

所以你看到的顺序往往像：

```text
mount effect
cleanup
mount effect (again)
```

这不是生产环境行为，但它揭示了一个重要事实：

> 你的 effect 必须是可重复执行、且 cleanup 必须正确。

换句话说：你不能在 effect 里写“只允许执行一次且无法恢复”的逻辑，除非你自己保证幂等。

---

## 9. 从 Class 到 Hooks：如何正确“迁移思维”

### 9.1 不要问“这相当于哪个生命周期？”

问法换成：

- 我在同步哪个外部系统？
- 这个同步依赖哪些渲染变量？
- 依赖变化时，我是否需要先清理旧同步，再建立新同步？

### 9.2 把副作用拆成更小的 effect

Class 时代你可能把很多逻辑堆在 `componentDidUpdate` 里，用 if 判断。

Hooks 更推荐把它们拆开：

```jsx
useEffect(() => {
  /* 同步 A */
}, [a])
useEffect(() => {
  /* 同步 B */
}, [b])
```

收益是：

- 依赖更清晰
- 更少的分支判断
- 更容易维护与测试

---

## 10. 本文小结：你应该带走的 4 个结论

1. **Hooks 模型关注“渲染快照 + 渲染后同步”，不是生命周期阶段**
2. `useEffect` 的语义是：**把 React 状态同步到外部系统**
3. deps 是语义声明：**哪些变量变化需要重新同步**
4. cleanup 的语义是：**清理上一次 effect 建立的副作用**（不只在卸载）
