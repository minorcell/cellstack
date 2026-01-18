---
title: '不仅仅是 HTML：JSX 的本质与虚拟 DOM 的演进'
description: '从“为什么 JSX 不能直接运行”这个痛点出发，拆开 Babel 转换链路，讲清 JSX/ReactElement 的本质、虚拟 DOM 解决的核心问题，以及它与 Fiber、Diff 的关系'
date: 2025-11-25
order: 1
---

> 这一篇先把两个最常见、也最容易“想当然”的概念讲透：**JSX 到底是什么**，以及所谓的 **虚拟 DOM 到底解决了什么问题**。  
> 你会发现：JSX 不“神秘”，虚拟 DOM 也不“万能”，它们真正的价值在于——**让 UI 描述变成可计算的数据结构**，从而让 React 能做调度、Diff、复用与跨平台渲染。

---

## 0. 从一个真实痛点开始：JSX 为啥不能直接运行？

你可能见过这种报错：

- `Unexpected token <`
- `Support for the experimental syntax 'jsx' isn't currently enabled`
- 或者在 Node 里直接跑 `.jsx` 文件直接炸掉

直觉上我们会说：“因为浏览器/Node 不认识 JSX”。这句话没错，但太浅了。

更准确的表述是：

- **JSX 不是 HTML**，也不是字符串模板
- **JSX 是一种语法糖**（syntax sugar），最终一定会被编译成 **普通 JavaScript 表达式**
- JSX 的“产物”也不是 DOM 节点，而是 **ReactElement（一个普通对象）**

带着这个结论，我们开始拆。

---

## 1. JSX 的本质：一段“返回对象”的表达式

看一段最普通的 JSX：

```jsx
const App = () => <div className="box">Hello</div>
```

如果你写成不使用 JSX 的形式，它本质上等价于：

```js
const App = () => React.createElement('div', { className: 'box' }, 'Hello')
```

也就是说，JSX 的核心不是“长得像 HTML”，而是：

- 它表达的是 **一个函数调用**
- 它返回的是 **一个可描述 UI 的数据结构**

这就引出了一个关键对象：**ReactElement**。

---

## 2. ReactElement 长什么样？（你其实一直在用它）

在 React 内部（概念层面），一个元素大致长这样：

```js
{
  $$typeof: Symbol(react.element),
  type: "div",
  key: null,
  ref: null,
  props: { className: "box", children: "Hello" },
  _owner: null
}
```

你不需要记字段，但要形成心智模型：

- **type**：告诉 React “我要渲染什么”（宿主标签 div / 或者函数组件 App）
- **props**：告诉 React “怎么渲染它”
- **children**：也是 props 的一部分，本质仍是数据

所以 JSX 的本质一句话就是：

> JSX 是一种更好写的方式，用来创建 ReactElement（可计算的 UI 描述对象）。

---

## 3. Babel 到底做了什么：从 JSX 到 `jsx/jsxs`（以及为什么不是 `createElement` 了）

很多文章停留在 “JSX -> createElement”，但在 React 17+ 的新 JSX Transform 里，常见产物是：

```js
import { jsx as _jsx } from 'react/jsx-runtime'

const App = () => _jsx('div', { className: 'box', children: 'Hello' })
```

你会看到它不再显式引用 `React`，这就是你现在写 JSX 不用 `import React from 'react'` 的原因。

### 为什么换了？

核心原因是工程与性能层面的优化：

1. **减少不必要的 React 默认导入**
2. `jsx/jsxs` 可以做更针对性的优化（比如 children 结构区分、开发期标记等）
3. 为后续编译期能力留空间（例如自动注入 source/self 信息，或更好的静态分析）

但不变的是：**JSX 最终就是 JavaScript**，并且最终都会生成 ReactElement（或等价结构）。

---

## 4. 那“虚拟 DOM”到底是什么？它不是 DOM，也不是性能魔法

“虚拟 DOM”这个词经常把人带偏，以为它是一个“更快的 DOM”。

更靠谱的定义是：

> 虚拟 DOM 是一种 **用 JavaScript 对象（树）描述 UI** 的方式。
> React 用它来做 **对比（Diff）**、**复用（Reuse）**、**调度（Schedule）**，最终再把变化落到真实宿主环境（浏览器 DOM / Native UI / Canvas / 小程序等）。

注意这句话的重点：**描述**、**对比**、**落地到宿主**。

---

## 5. 虚拟 DOM 解决的核心问题：不是“更快”，而是“可控”

很多面试会问：虚拟 DOM 有什么好处？
标准答案往往是：“减少 DOM 操作，提高性能”。

这句话在今天已经不够准确。

更关键的价值在于 **可控性**：

### 5.1 让 UI 更新从“命令式”变成“声明式”

命令式（你手动写怎么改）：

```js
const el = document.getElementById('count')
el.textContent = count
el.className = count > 10 ? 'hot' : 'cold'
```

声明式（你只描述状态对应的 UI 长什么样）：

```jsx
<div className={count > 10 ? 'hot' : 'cold'}>{count}</div>
```

声明式的关键是：
你不再描述“怎么改 DOM”，而只描述“状态 -> 视图”。

### 5.2 让“对比差异”成为可能：Diff 的输入是两棵树

有了 ReactElement 树（虚拟树），React 才能做：

- 上一次 render 得到的树：`prevTree`
- 当前 render 得到的树：`nextTree`
- 计算差异：`patches`
- 最后再把差异提交到宿主环境

你可以用一句公式记住：

> UI = f(state)
> Diff = compare(f(prevState), f(nextState))

### 5.3 让“跨平台渲染”成为可能

因为 ReactElement 只是描述，不绑定 DOM。

- React DOM：把描述落到浏览器 DOM
- React Native：把描述落到原生控件
- 其他 renderer：落到任何宿主（Canvas/WebGL/小程序）

所以虚拟 DOM 的价值，不是“替代 DOM”，而是“**抽象 DOM**”。

---

## 6. 一个最小 Diff 心智模型：React 不是“全量重绘”，而是“重新计算 + 最小提交”

一个非常容易误解的点：

- React 每次状态更新，**确实会重新执行 render（重新计算）**
- 但不代表它会把 DOM 全部重建
- 它会通过 Diff 计算“最小变更”，再提交

你可以把 React 更新过程先理解为两段（先别急着上 Fiber）：

1. **Render 阶段（计算）**：得到新的 ReactElement 树
2. **Commit 阶段（提交）**：把变更应用到宿主环境（真实 DOM）

> 重新计算很便宜（JS 运算），真正昂贵的是 commit 到 DOM（布局/绘制/合成）。

---

## 7. 图解：从 JSX 到真实 DOM 的路径（概念版）

下面这张“概念流水线”建议背下来当心智模型：

```text
JSX
  ↓ (Babel)
ReactElement（对象树 / 虚拟树）
  ↓ (Render: 计算 + Diff)
Effects / Patches（需要更新什么）
  ↓ (Commit: 提交到宿主)
DOM / Native UI
```

这张图的关键点是：

- JSX 只是入口
- ReactElement 是数据结构核心
- DOM 是最终落地，不是 React 的“直接输出物”

---

## 8. 常见误区澄清（面试/实战都爱踩）

### 误区 1：虚拟 DOM 一定比 DOM 快

不一定。
如果你每次都生成很大的树、或者 commit 很重，依然会慢。

React 的优势是把更新过程结构化、可调度、可优化，而不是“天然更快”。

### 误区 2：JSX 就是 HTML

JSX 更接近“函数调用 + 对象创建”。
它像 HTML 只是为了更易读。

### 误区 3：React 更新就是 DOM diff

React 的对比并不直接在 DOM 上做，而是在 **ReactElement / Fiber 结构**上做（后面会讲 Fiber）。
DOM 是最终 commit 的目标，而不是 diff 的输入。

---

## 9. 本文小结：你应该带走的 3 个结论

1. **JSX = 语法糖**，最终会编译成 JS 表达式，产物是 **ReactElement 对象**
2. **虚拟 DOM = UI 的数据化描述**，价值是“可控”：能 Diff、能调度、能跨平台
3. React 更新的关键不是“重绘”，而是：**重新计算 + 最小提交**

---

## 10. 下一篇预告（2025-11-27）

下一篇我们会从另一个经典痛点切入：

> **为什么不能直接修改 state？为什么 setState/useState 需要“不可变”？**

我们会把“不可变数据”与 React 更新触发机制、引用比较、批处理更新的关系讲清楚，并用几个“看似没问题但就是不更新”的例子做推导。

---

## 附：动手练习（建议你真的跑一下）

你可以在任意 React 环境（Vite/Create React App）里加一句：

```jsx
console.log(<div className="box">Hello</div>)
```

观察输出，你会亲眼看到它不是 DOM 节点，而是一个对象（ReactElement）。

如果你愿意更进一步：

- 把 JSX 改写为 `React.createElement`
- 或者打开构建产物看看 `jsx-runtime` 的编译结果

当你能用“对象树”的视角看待 JSX，你已经迈进 React 核心世界的第一步了。
