---
title: '渲染的代价：如何避免组件的无效重绘？'
description: '从“父组件一更新，子组件全跟着重渲染”这个性能痛点出发，讲清 React 重渲染的真实触发条件，并系统对比 React.memo、useMemo、useCallback 的作用边界与常见误用；给出一套可推理的优化流程：先定位、再稳定引用、最后减少计算与渲染面积'
date: 2025-12-13
order: 10
---

> 性能问题最让人烦的一点是：你明明只改了一个小状态，结果一大片组件都在重渲染。  
> 然后你开始到处加 `React.memo`、`useMemo`、`useCallback`，加着加着：
>
> - 有的地方确实快了
> - 有的地方没变化
> - 还有的地方反而更慢、代码更乱
>
> 这篇我们用“能推理”的方式把它讲透：  
> **React 为什么会重渲染？哪些重渲染是无效的？三大 memo 工具各自解决什么？**  
> 你会得到一套明确流程：**先定位瓶颈，再针对性稳定引用与减少工作量**。

---

## 0. 先讲真相：重渲染不等于重绘 DOM，更不等于一定慢

很多人一看到 render 次数就焦虑。

要先分清三件事：

1. **Re-render（重新执行组件函数）**：计算新的 ReactElement/Fiber
2. **Reconciliation（Diff）**：对比新旧，决定哪些地方变
3. **Commit（提交 DOM 变更）**：真正操作 DOM、触发布局/绘制

React 很多时候“重渲染”只是重新计算，最后 commit 可能非常小甚至为 0。

所以性能优化的目标不是“消灭所有重渲染”，而是：

> **减少昂贵的渲染与计算，缩小需要提交的变更范围。**

---

## 1. React 什么时候会让组件重渲染？（三大触发源）

一个组件重渲染，通常来自：

1. **自身 state 更新**（useState/useReducer）
2. **父组件重渲染导致 props 变化**（或即使 props 不变，也会重新执行子组件，除非 memo）
3. **context 变化**（useContext 所订阅的 Provider value 变了）

把这三条记住，你就能解释 90% “为什么它又 render 了”。

---

## 2. 什么是“无效重绘”？（更准确叫：无效重渲染）

无效重渲染通常指：

- 组件重新执行了，但**输出 UI 没变**
- 或者变更范围很小，但你让大量组件参与了 diff

常见症状：

- 父组件里一个输入框 setState，整个列表每个 item 都 render
- 只改了一个字段，导致整个页面的大组件树都计算一遍
- 某个昂贵计算（排序/过滤/聚合）每次 render 都重新跑

---

## 3. React.memo：拦截“props 没变”的子组件重渲染

### 3.1 它解决什么？

当父组件 re-render 时，子组件默认也会 re-render。

`React.memo` 做的是：

> 如果子组件的 props “浅比较”后没有变化，就跳过子组件的 re-render。

```jsx
const Item = React.memo(function Item({ value }) {
  return <div>{value}</div>
})
```

### 3.2 关键：浅比较（shallow compare）

浅比较意味着：

- 基础类型（number/string/boolean）按值比
- 对象/数组/函数按引用比（===）

所以你会遇到一个经典现象：

```jsx
<Item style={{ padding: 8 }} />
```

即使内容一样，每次 render 都创建新对象：

- `style` 引用变了
- memo 失效
- Item 仍然重渲染

这就引出了 useMemo/useCallback 的用武之地。

---

## 4. useMemo：缓存“计算结果”，不是缓存渲染

### 4.1 它解决什么？

当你有昂贵计算，并且：

- 输入没变时，结果也不变
- 但你不想每次 render 都重新算

```jsx
const filtered = React.useMemo(() => {
  return list.filter((x) => x.includes(keyword))
}, [list, keyword])
```

### 4.2 常见误区：用 useMemo “到处包对象”

很多人为了配合 memo，会写：

```jsx
const props = useMemo(() => ({ a, b }), [a, b])
```

这不是绝对错，但你要明白代价：

- useMemo 本身也要维护缓存与依赖
- 如果对象很小、组件很轻，收益可能为 0 或负收益

经验法则：

> useMemo 适用于“计算贵”或“作为稳定引用传给 memo 子组件时确实能减少大量渲染”。

---

## 5. useCallback：缓存“函数引用”，让 props 更稳定

### 5.1 它解决什么？

函数在 JS 里也是对象，定义在组件内每次 render 都是新引用：

```jsx
function Parent() {
  const onClick = () => {}
  return <Child onClick={onClick} />
}
```

即使逻辑一样，`onClick` 引用每次变：

- Child 的 props 变了
- memo 失效

用 `useCallback` 可以稳定引用：

```jsx
const onClick = React.useCallback(() => {
  // ...
}, [deps])
```

### 5.2 误区：useCallback 会让函数“更快”吗？

不会。它只是让函数引用更稳定，减少由于引用变化导致的重渲染。

如果你的 Child 根本没 memo，或者重渲染成本很低：

- useCallback 可能没收益
- 反而增加代码复杂度

---

## 6. 三者怎么配合？一个最典型的“正确链路”

场景：父组件状态更新频繁，子列表很大。

- 子项用 `React.memo`
- 传给子项的对象/函数用 `useMemo/useCallback` 稳定引用
- 列表过滤/排序用 `useMemo` 缓存昂贵计算

示例（概念）：

```jsx
const Item = React.memo(function Item({ item, onToggle }) {
  return <li onClick={() => onToggle(item.id)}>{item.text}</li>
})

function List({ items }) {
  const [keyword, setKeyword] = React.useState('')

  const filtered = React.useMemo(() => {
    return items.filter((i) => i.text.includes(keyword))
  }, [items, keyword])

  const onToggle = React.useCallback((id) => {
    // ...
  }, [])

  return (
    <>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <ul>
        {filtered.map((item) => (
          <Item key={item.id} item={item} onToggle={onToggle} />
        ))}
      </ul>
    </>
  )
}
```

这时如果 keyword 变化：

- List 会 render
- filtered 会重新算（必要）
- Item 只有在对应 item 或 onToggle 引用变化时才会 render
- onToggle 不变，item 引用若稳定，可大幅减少 Item 渲染量

---

## 7. 性能优化的正确顺序：不要一上来就 memo

给你一个可操作的流程（强烈推荐按这个来）：

### Step 1：先定位“谁在频繁 render，谁最贵”

你要抓的是：

- render 次数多
- 单次 render 计算/子树大

没有定位就 memo，等于盲打。

### Step 2：缩小状态影响范围（比 memo 更有效）

把 state 下沉到真正需要的组件：

- 输入框 state 放输入框组件里
- 列表每行的局部 state 放 Row 里
- Provider 下沉，避免全局 context 变动影响全树

很多时候这一步就解决了大半问题。

### Step 3：再用 memo 工具做“精准拦截”

- 子组件重渲染多：`React.memo`
- 传参引用不稳定：`useMemo/useCallback`
- 昂贵计算重复：`useMemo`

---

## 8. 两个非常常见的“优化反而更慢”案例

### 案例 1：对轻组件过度 memo

如果组件很轻（只是几个 div），memo 的浅比较成本 + 维护复杂度，可能不划算。

### 案例 2：依赖数组写得不稳定导致“缓存永远失效”

比如依赖里放了每次都变的对象：

```jsx
useMemo(() => ..., [{ a: 1 }]); // 每次都是新对象
```

结果：

- 每次都重新算
- 还白白付出了 memo 的管理成本

---

## 9. 本文小结：三大工具各司其职

你只要把它们当成三把不同的刀：

- **React.memo**：挡住“props 没变”的子组件重渲染
- **useMemo**：缓存“昂贵计算结果”或“稳定对象引用”
- **useCallback**：稳定“函数引用”，配合 memo 避免子组件因回调变化重渲染

以及一条总原则：

> 先定位与拆分，再 memo；减少渲染面积，永远比“缓存一切”更有效。
