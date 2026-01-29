---
title: '虚拟 DOM 与 Diff 算法：Vue 的高效更新策略'
description: '从"为什么列表更新后输入框内容错乱"这个真实 bug 出发,深入剖析 Vue 的模板编译、虚拟 DOM 结构、Diff 算法(双端比较)以及 key 的真实作用'
date: 2025-01-30
order: 2
---

> 你肯定遇到过这些怪事:
>
> - 列表删除第一项,最后一项的输入框内容跑到第二项了
> - 列表重新排序,勾选状态对不上了
> - 加了 key 性能反而变差了
>
> 这些问题的根源都是:**你没理解 Diff 算法的复用逻辑,以及 key 的真实作用**。
> 这一篇我们从**模板编译到虚拟 DOM,再到 Diff 算法**,把 Vue 的更新链路讲透。

---

## 0. 先给你一句总纲:虚拟 DOM 不是为了"快",而是为了"可控的批量更新"

很多人认为虚拟 DOM 比原生 DOM 操作快,这是误解。

**真相是**:

- 直接操作 DOM(`innerHTML`/`createElement`)在小规模下更快
- 但大规模更新时,虚拟 DOM 的优势在于:
  1. **批量 Diff**:找出最小变更集
  2. **异步更新**:合并多次修改,一次性提交
  3. **跨平台**:同一套虚拟 DOM 可渲染到不同平台(Web/Native)

核心是:**可预测的性能上限 + 开发体验**。

---

## 1. 从模板到虚拟 DOM:Vue 的编译链路

### 1.1 模板编译的三个阶段

Vue 的模板不能直接运行,需要编译成渲染函数:

```text
模板(Template) → AST(抽象语法树) → 渲染函数(render) → 虚拟 DOM(VNode)
```

举个例子:

```vue
<template>
  <div id="app" class="container">
    <p>{{ message }}</p>
    <button @click="handleClick">Click</button>
  </div>
</template>
```

#### 阶段 1:解析(parse) - 生成 AST

```js
{
  type: 1, // 元素节点
  tag: 'div',
  attrsList: [
    { name: 'id', value: 'app' },
    { name: 'class', value: 'container' }
  ],
  children: [
    {
      type: 1,
      tag: 'p',
      children: [
        { type: 2, expression: '_s(message)', text: '{{ message }}' }
      ]
    },
    {
      type: 1,
      tag: 'button',
      events: { click: 'handleClick' },
      children: [{ type: 3, text: 'Click' }]
    }
  ]
}
```

#### 阶段 2:优化(optimize) - 标记静态节点

Vue 会标记永远不会改变的节点,跳过 Diff:

```js
{
  type: 1,
  tag: 'div',
  static: false, // 动态节点(有绑定)
  children: [
    {
      tag: 'button',
      static: true, // 静态节点(纯文本)
      children: [{ text: 'Click', static: true }]
    }
  ]
}
```

#### 阶段 3:生成(generate) - 生成渲染函数

```js
function render() {
  with (this) {
    return _c('div', { attrs: { id: 'app', class: 'container' } }, [
      _c('p', [_v(_s(message))]),
      _c('button', { on: { click: handleClick } }, [_v('Click')]),
    ])
  }
}
```

- `_c` = `createElement`
- `_v` = `createTextVNode`
- `_s` = `toString`

### 1.2 渲染函数执行生成虚拟 DOM

```js
{
  tag: 'div',
  data: {
    attrs: { id: 'app', class: 'container' }
  },
  children: [
    {
      tag: 'p',
      children: [
        { text: 'Hello Vue', isComment: false }
      ]
    },
    {
      tag: 'button',
      data: {
        on: { click: handleClick }
      },
      children: [{ text: 'Click' }]
    }
  ],
  elm: undefined, // 真实 DOM 节点(初次为空)
  key: undefined
}
```

**关键字段**:

- `tag`:标签名或组件
- `data`:属性/事件/指令等
- `children`:子节点数组
- `elm`:对应的真实 DOM 节点
- `key`:节点唯一标识(Diff 关键)

---

## 2. Diff 算法:如何找出最小变更?

### 2.1 Diff 的核心假设

Vue(和 React)的 Diff 算法基于两个假设:

1. **只做同层比较**:不考虑跨层级移动
2. **不同类型节点直接替换**:不尝试复用

这把复杂度从 O(n³) 降到 O(n)。

### 2.2 单节点 Diff:sameVnode 判断

Vue 判断两个节点是否"相同",看这几个属性:

```js
function sameVnode(a, b) {
  return (
    a.key === b.key && // key 必须相同
    a.tag === b.tag && // 标签必须相同
    a.isComment === b.isComment && // 注释节点标识
    isDef(a.data) === isDef(b.data) && // data 存在性一致
    sameInputType(a, b) // input 类型一致
  )
}
```

**如果相同**:复用节点,更新属性和子节点
**如果不同**:删除旧节点,创建新节点

### 2.3 多节点 Diff:双端比较算法

这是 Vue 2 的核心 Diff 策略,也是面试重点。

#### 场景:列表更新

```js
// 旧节点
;[A, B, C, D]

// 新节点
;[B, A, D, C]
```

#### 双端比较的四个指针

```text
旧列表: [A, B, C, D]
         ↑        ↑
      oldStart  oldEnd

新列表: [B, A, D, C]
         ↑        ↑
      newStart  newEnd
```

#### 比较步骤

**第 1 轮**:

1. `oldStart(A)` vs `newStart(B)` → 不同
2. `oldEnd(D)` vs `newEnd(C)` → 不同
3. `oldStart(A)` vs `newEnd(C)` → 不同
4. `oldEnd(D)` vs `newStart(B)` → 不同
5. **用 key 在旧列表中查找 B** → 找到索引 1
6. 移动 B 到 oldStart 前面,标记旧 B 为 undefined

```text
旧: [A, undefined, C, D]
新: [B, A, D, C]
         ↑
```

**第 2 轮**:

1. `oldStart(A)` vs `newStart(A)` → **相同!**
2. 复用 A,指针向内移动

```text
旧: [A✓, undefined, C, D]
新: [B✓, A✓, D, C]
```

**第 3 轮**:

1. 跳过 undefined
2. `oldStart(C)` vs `newStart(D)` → 不同
3. `oldEnd(D)` vs `newEnd(C)` → 不同
4. `oldStart(C)` vs `newEnd(C)` → **相同!**
5. 移动 C 到 oldEnd 后面

**第 4 轮**:

1. `oldStart(D)` vs `newStart(D)` → **相同!**
2. 复用 D

**最终结果**:

```text
[B, A, D, C]
```

**操作统计**:移动 2 次(B、C),复用 2 次(A、D)

### 2.4 Vue 3 的优化:最长递增子序列

Vue 3 改用**快速 Diff 算法**,核心是找**最长递增子序列(LIS)**:

```js
// 旧: [A, B, C, D, E]
// 新: [B, A, D, C, E]

// 1. 预处理:头尾相同节点
// 头: 无
// 尾: E 相同

// 2. 中间乱序部分: [A,B,C,D] → [B,A,D,C]

// 3. 建立新节点索引映射
// B→0, A→1, D→2, C→3

// 4. 在旧节点中找对应位置
// [1, 0, 3, 2] (B在旧列表位置1,A在0...)

// 5. 找最长递增子序列
// [0, 2] 对应 [A, C]

// 6. 只需移动非子序列节点 B 和 D
```

**优势**:减少移动次数,性能更好。

---

## 3. key 的真实作用:身份标识,而非性能开关

### 3.1 误区:key 只是为了性能

很多人以为"加了 key 就快",其实:**key 的核心是确保节点身份稳定**。

### 3.2 为什么 index 当 key 会出问题?

```vue
<li v-for="(item, index) in list" :key="index">
  <input v-model="item.value" />
  {{ item.name }}
</li>
```

**初始状态**:

```text
[
  { name: 'A', value: '' }, // key=0
  { name: 'B', value: '' }, // key=1
  { name: 'C', value: '' }  // key=2
]
```

用户在第一个输入框输入 "Hello",然后**删除第一项**:

**删除后**:

```text
[
  { name: 'B', value: '' }, // key=0 (变了!)
  { name: 'C', value: '' }  // key=1 (变了!)
]
```

**Diff 结果**:

- 旧 key=0 (A) vs 新 key=0 (B) → sameVnode 为 true (key 相同)
- **Vue 认为是同一个节点,复用了 DOM**
- 但数据变了,所以更新文本为 "B"
- **输入框的 value 没被 Vue 管理,所以"Hello"还在!**

**结果**:B 的输入框显示 "Hello"(本该是 A 的)

### 3.3 正确做法:用唯一 ID

```vue
<li v-for="item in list" :key="item.id">
  <input v-model="item.value" />
  {{ item.name }}
</li>
```

这样删除 A 时:

- 旧 key='a' 在新列表中不存在 → **销毁节点**
- 新 key='b'/key='c' 在旧列表中存在 → **复用节点**

输入框内容跟着正确的节点走。

### 3.4 什么时候可以用 index?

1. **列表是静态的**(不会增删改)
2. **列表项没有状态**(纯展示)
3. **不会重新排序**

例如:

```vue
<li v-for="(color, index) in ['red', 'green', 'blue']" :key="index">
  {{ color }}
</li>
```

---

## 4. 虚拟 DOM 的性能真相

### 4.1 虚拟 DOM 一定比原生快吗?

**不一定!**

| 场景           | 原生 DOM           | 虚拟 DOM               |
| -------------- | ------------------ | ---------------------- |
| 首次渲染       | 快(直接 innerHTML) | 慢(多一层 VNode 生成)  |
| 小规模更新     | 快(直接改 DOM)     | 慢(Diff 开销)          |
| 大规模批量更新 | 慢(频繁重排重绘)   | 快(Diff + 批量 patch)  |
| 跨平台         | 不可能             | 可以(抽象层)           |

### 4.2 虚拟 DOM 的真正价值

1. **声明式编程**:不需手动操作 DOM
2. **批量更新**:合并多次修改
3. **跨平台能力**:Web/Weex/小程序
4. **可预测的性能**:不会出现"超慢"的情况

**Vue 3 的编译优化**:

- **静态提升**:静态节点只创建一次
- **patchFlag**:标记动态内容类型,跳过不必要的比较
- **事件缓存**:事件处理函数不每次重新创建

---

## 5. 模板编译优化:Vue 3 的 Block Tree

### 5.1 Vue 2 的问题:全量 Diff

```vue
<div>
  <span>静态文本</span>
  <span>{{ dynamic }}</span>
</div>
```

Vue 2 每次更新都要遍历所有子节点,即使第一个 `<span>` 永远不变。

### 5.2 Vue 3 的 Block Tree

编译时生成:

```js
const _hoisted_1 = /*#__PURE__*/ _createElementVNode('span', null, '静态文本', -1)

export function render(_ctx) {
  return (
    _openBlock(),
    _createElementBlock('div', null, [
      _hoisted_1, // 静态节点提升
      _createElementVNode('span', null, _toDisplayString(_ctx.dynamic), 1 /* TEXT */),
    ])
  )
}
```

**patchFlag = 1** 表示"只有文本内容是动态的",Diff 时只比较文本。

**Block**:收集所有动态子节点,Diff 时只遍历这些节点。

---

## 6. 面试高频问题汇总

### Q1:虚拟 DOM 的优势是什么?

1. **批量 Diff**:最小化 DOM 操作
2. **跨平台**:抽象层可适配不同渲染目标
3. **声明式**:提升开发体验
4. **可预测性能**:避免极端情况

### Q2:Vue 的 Diff 算法是怎样的?

- Vue 2:**双端比较**,四个指针,优先头尾匹配,再用 key 查找
- Vue 3:**快速 Diff**,最长递增子序列,减少移动次数

**复杂度**:O(n)

### Q3:为什么不能用 index 做 key?

**不是"不能用",而是有前提**:

- 列表会**增删改排序**时,index 会变化,导致节点身份错乱
- 有**状态的子组件**(input/checkbox)会复用到错误的节点

**适用场景**:静态列表、纯展示

### Q4:sameVnode 的判断条件是什么?

```js
a.key === b.key &&
  a.tag === b.tag &&
  a.isComment === b.isComment &&
  isDef(a.data) === isDef(b.data) &&
  sameInputType(a, b)
```

**重点**:key 相同 + tag 相同才复用

### Q5:Vue 3 编译优化有哪些?

1. **静态提升**(hoisting):静态节点只创建一次
2. **patchFlag**:标记动态类型,精准 Diff
3. **Block Tree**:收集动态节点,跳过静态节点
4. **事件缓存**:避免每次重新创建函数

---

## 7. 总结:Diff 算法的心智模型

```text
1. 新旧 VNode 树对比
       ↓
2. 同层比较(不跨层)
       ↓
3. sameVnode 判断(key + tag)
       ↓
4. 相同:复用 + patch 属性/子节点
   不同:销毁 + 创建
       ↓
5. 多节点:双端比较/快速 Diff
       ↓
6. 生成最小 DOM 操作指令
       ↓
7. 批量提交到真实 DOM
```

**面试答题框架**:

1. **是什么**:通过对比新旧虚拟 DOM,找出最小变更
2. **怎么做**:同层比较 + key 标识 + 双端/快速算法
3. **为什么**:减少 DOM 操作,批量更新,可预测性能
4. **注意什么**:key 的选择,静态优化,patchFlag

记住:**Diff 的目标不是"完美最优",而是"工程可行的最优"**。
