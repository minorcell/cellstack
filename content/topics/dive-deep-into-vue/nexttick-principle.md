---
title: 'nextTick 原理：DOM 更新时机与微任务'
description: '深入理解 Vue 的异步更新队列、nextTick 的实现原理、与 Event Loop 的关系,以及如何正确获取更新后的 DOM'
date: 2025-01-30
order: 7
---

> 你肯定遇到过这种情况:
>
> - 修改数据后,立即获取 DOM,拿到的还是旧值
> - 不知道什么时候用 nextTick,什么时候用 setTimeout
> - 搞不清 nextTick 和微任务、宏任务的关系
>
> 这一篇我们把**异步更新队列、nextTick 原理、Event Loop**讲透。

---

## 1. 为什么需要 nextTick?

### 1.1 问题复现

```vue
<script setup>
import { ref } from 'vue'

const message = ref('Hello')

const updateMessage = () => {
  message.value = 'World'
  console.log(document.querySelector('#msg').textContent) // 输出: Hello (旧值!)
}
</script>

<template>
  <div id="msg">{{ message }}</div>
  <button @click="updateMessage">Update</button>
</template>
```

**原因**:Vue 的 DOM 更新是**异步的**,修改数据后不会立即更新 DOM。

### 1.2 使用 nextTick 解决

```js
import { nextTick } from 'vue'

const updateMessage = async () => {
  message.value = 'World'

  await nextTick()
  console.log(document.querySelector('#msg').textContent) // 输出: World (新值!)
}
```

---

## 2. Vue 的异步更新策略

### 2.1 为什么要异步更新?

如果同步更新,性能会很差:

```js
this.count = 1 // 触发更新,重新渲染
this.count = 2 // 再次更新,再次渲染
this.count = 3 // 又一次更新,又一次渲染
```

一次事件循环内修改了 3 次,却渲染了 3 次!

**Vue 的解决方案**:

1. 把所有更新放入**队列**
2. 在**下一个微任务**中批量执行
3. 只渲染一次

```js
this.count = 1 // 加入队列
this.count = 2 // 合并到同一个队列
this.count = 3 // 合并到同一个队列

// 微任务中执行:只渲染一次
```

### 2.2 更新队列的实现

```js
// 简化版
const queue = []
let pending = false

function queueWatcher(watcher) {
  queue.push(watcher)

  if (!pending) {
    pending = true
    nextTick(flushQueue) // 在下一个微任务中执行
  }
}

function flushQueue() {
  queue.forEach((watcher) => watcher.run())
  queue.length = 0
  pending = false
}
```

---

## 3. nextTick 的实现原理

### 3.1 优先级降级策略

Vue 会按以下顺序选择异步方案:

```js
// Vue 2
if (typeof Promise !== 'undefined') {
  // 1. Promise.then (微任务)
  nextTick = () => Promise.resolve().then(flushCallbacks)
} else if (typeof MutationObserver !== 'undefined') {
  // 2. MutationObserver (微任务)
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode('1')
  observer.observe(textNode, { characterData: true })
  nextTick = () => {
    textNode.data = '2'
  }
} else if (typeof setImmediate !== 'undefined') {
  // 3. setImmediate (宏任务,IE/Node)
  nextTick = () => setImmediate(flushCallbacks)
} else {
  // 4. setTimeout (宏任务,兜底)
  nextTick = () => setTimeout(flushCallbacks, 0)
}
```

**Vue 3 的简化**:直接用 Promise.resolve().then()

```js
// Vue 3 源码
export function nextTick(fn?: () => void): Promise<void> {
  const p = Promise.resolve()
  return fn ? p.then(fn) : p
}
```

### 3.2 为什么优先用微任务?

| 类型   | 执行时机               | 优缺点                          |
| ------ | ---------------------- | ------------------------------- |
| 微任务 | 当前宏任务结束后立即执行| 更快,用户感知延迟小             |
| 宏任务 | 下一个事件循环         | 较慢,可能有视觉闪烁             |

**示例**:

```js
console.log('1')

setTimeout(() => {
  console.log('2. 宏任务')
}, 0)

Promise.resolve().then(() => {
  console.log('3. 微任务')
})

console.log('4')

// 输出顺序: 1 → 4 → 3. 微任务 → 2. 宏任务
```

---

## 4. nextTick 与 Event Loop

### 4.1 完整的执行流程

```text
同步代码
  ↓
修改数据
  ↓
加入 watcher 队列
  ↓
nextTick(flushQueue)
  ↓
【微任务队列】
  ↓
执行所有 watcher.run()
  ↓
DOM 更新完成
  ↓
执行用户的 nextTick 回调
```

### 4.2 代码示例

```js
const count = ref(0)

function update() {
  console.log('1. 开始')

  count.value++
  console.log('2. 数据已改,DOM 未更新')

  nextTick(() => {
    console.log('4. nextTick 回调,DOM 已更新')
    console.log(document.querySelector('#count').textContent) // 1
  })

  console.log('3. nextTick 已调用,但回调还未执行')
}

// 输出顺序:
// 1. 开始
// 2. 数据已改,DOM 未更新
// 3. nextTick 已调用,但回调还未执行
// 4. nextTick 回调,DOM 已更新
```

---

## 5. nextTick 的使用场景

### 场景 1:获取更新后的 DOM

```js
const list = ref([1, 2, 3])

const addItem = async () => {
  list.value.push(4)

  await nextTick()
  // 此时可以获取新增的 DOM 元素
  const newItem = document.querySelector('.item:last-child')
  newItem.scrollIntoView()
}
```

### 场景 2:操作第三方库

```js
import ECharts from 'echarts'

const chartData = ref([])
let chart = null

const updateChart = async () => {
  chartData.value = await fetchData()

  await nextTick()
  // 确保 DOM 更新后再调用 echarts
  if (!chart) {
    chart = ECharts.init(document.getElementById('chart'))
  }
  chart.setOption({ data: chartData.value })
}
```

### 场景 3:测试中等待渲染

```js
import { mount } from '@vue/test-utils'

test('should update DOM', async () => {
  const wrapper = mount(Component)

  await wrapper.vm.updateData()
  await nextTick()

  expect(wrapper.text()).toBe('Updated')
})
```

---

## 6. 常见陷阱

### 陷阱 1:连续调用 nextTick

```js
const count = ref(0)

count.value = 1
nextTick(() => {
  console.log('A:', count.value)
})

count.value = 2
nextTick(() => {
  console.log('B:', count.value)
})

// 输出:
// A: 2
// B: 2
// 两个回调在同一个微任务中执行,此时 count 已经是 2
```

### 陷阱 2:在 watch 中使用 nextTick

```js
watch(count, async (newVal) => {
  console.log('watch 触发,DOM 未更新')

  await nextTick()
  console.log('DOM 已更新')
})

// ✅ 正确,watch 回调在 DOM 更新前执行
```

**但如果用 flush: 'post':**

```js
watch(
  count,
  (newVal) => {
    console.log('watch 触发,DOM 已更新')
    // 不需要 nextTick
  },
  { flush: 'post' }
)
```

### 陷阱 3:nextTick 不能解决所有异步问题

```js
const data = ref(null)

const fetchData = async () => {
  await nextTick()
  // ❌ nextTick 不会等待网络请求
  data.value = await api.getData() // 仍需 await
}
```

---

## 7. nextTick vs setTimeout

| 对比     | nextTick                | setTimeout           |
| -------- | ----------------------- | -------------------- |
| 任务类型 | 微任务                  | 宏任务               |
| 执行时机 | 当前宏任务结束后立即执行| 下一个事件循环       |
| 性能     | 更快                    | 较慢(至少 4ms 延迟)  |
| 用途     | 等待 DOM 更新           | 延时执行             |

**示例**:

```js
count.value = 1

nextTick(() => {
  console.log('nextTick:', count.value) // 1
})

setTimeout(() => {
  console.log('setTimeout:', count.value) // 1
}, 0)

// nextTick 先执行
```

---

## 8. 面试高频问题

### Q1:为什么 Vue 的 DOM 更新是异步的?

**原因**:

1. **性能优化**:合并多次更新,只渲染一次
2. **避免不必要的计算**:同一个 tick 内的多次修改会被去重

### Q2:nextTick 的实现原理?

1. 优先使用**微任务**(Promise.then)
2. 降级方案:MutationObserver → setImmediate → setTimeout
3. 将回调加入队列,在下一个微任务中执行

### Q3:nextTick 和 $nextTick 有什么区别?

```js
// Vue 3
import { nextTick } from 'vue'
nextTick(() => {})

// Vue 2
this.$nextTick(() => {})
```

**本质一样**,只是调用方式不同。

### Q4:能手写一个简单的 nextTick 吗?

```js
const callbacks = []
let pending = false

function nextTick(cb) {
  callbacks.push(cb)

  if (!pending) {
    pending = true
    Promise.resolve().then(() => {
      pending = false
      const cbs = callbacks.slice(0)
      callbacks.length = 0
      cbs.forEach((cb) => cb())
    })
  }
}
```

---

## 9. 总结

**核心记忆点**:

1. **异步更新**:Vue 会合并同一 tick 内的多次修改
2. **微任务**:nextTick 用 Promise.then 实现
3. **使用场景**:需要操作更新后的 DOM 时

**面试答题框架**:

1. **为什么**:性能优化,批量更新
2. **怎么做**:微任务队列,Promise.then
3. **何时用**:获取更新后的 DOM、操作第三方库
4. **注意**:不是所有异步都能用 nextTick

记住:**nextTick 让你在"DOM 更新完成"后做事情**。
