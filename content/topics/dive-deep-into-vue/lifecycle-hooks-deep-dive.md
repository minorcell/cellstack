---
title: '生命周期深度解析：从创建到销毁的完整流程'
description: '深入理解 Vue 组件生命周期钩子的执行时机、父子组件生命周期顺序、Options API vs Composition API 的差异,以及常见的生命周期陷阱'
date: 2025-01-30
order: 4
---

> 你肯定遇到过这些问题:
>
> - 在 `created` 里能操作 DOM 吗?为什么拿不到元素?
> - 父子组件的生命周期顺序是怎样的?
> - `mounted` 一定代表子组件也挂载了吗?
> - Composition API 里没有 `beforeCreate` 和 `created`,用什么替代?
>
> 这一篇我们把生命周期的**执行时机、调用顺序、常见陷阱**讲透。

---

## 1. Vue 2/3 生命周期对照表

### 1.1 Options API(Vue 2/3 通用)

```text
创建阶段:
  beforeCreate  →  setup()  →  created
挂载阶段:
  beforeMount   →  onBeforeMount  →  mounted
更新阶段:
  beforeUpdate  →  onBeforeUpdate  →  updated
卸载阶段:
  beforeUnmount →  onBeforeUnmount  →  unmounted
```

| Vue 2         | Vue 3         | Composition API | 执行时机                |
| ------------- | ------------- | --------------- | ----------------------- |
| beforeCreate  | beforeCreate  | setup() 开始    | 实例初始化,数据劫持前   |
| created       | created       | setup() 中      | 数据劫持完成,DOM 未挂载 |
| beforeMount   | beforeMount   | onBeforeMount   | 挂载前,render 未调用    |
| mounted       | mounted       | onMounted       | 挂载完成,可操作 DOM     |
| beforeUpdate  | beforeUpdate  | onBeforeUpdate  | 数据变化,重新渲染前     |
| updated       | updated       | onUpdated       | 重新渲染完成            |
| beforeDestroy | beforeUnmount | onBeforeUnmount | 卸载前,实例仍可用       |
| destroyed     | unmounted     | onUnmounted     | 卸载完成,清理副作用     |
| activated     | activated     | onActivated     | keep-alive 激活         |
| deactivated   | deactivated   | onDeactivated   | keep-alive 停用         |
| errorCaptured | errorCaptured | onErrorCaptured | 捕获子组件错误          |

---

## 2. 各生命周期的典型用途

### beforeCreate / setup() 开始

```js
// ❌ 不能访问 data/computed/methods
// ❌ 不能访问 DOM
// ✅ 可以初始化非响应式数据
export default {
  beforeCreate() {
    console.log(this.message) // undefined
  },
}
```

### created / setup() 中

```js
// ✅ 可以访问 data/computed/methods
// ❌ 不能访问 DOM(未挂载)
// ✅ 适合:数据初始化、API 请求
export default {
  data() {
    return { list: [] }
  },
  created() {
    this.fetchList()
  },
}
```

### beforeMount

```js
// ✅ render 函数首次被调用
// ❌ 真实 DOM 还未创建
// 很少使用
```

### mounted

```js
// ✅ 真实 DOM 已挂载
// ✅ 可以操作 DOM、初始化第三方库
onMounted(() => {
  const chart = new ECharts(document.getElementById('chart'))
})
```

### beforeUpdate

```js
// ✅ 数据已变化,DOM 未更新
// ✅ 可以在此访问更新前的 DOM 状态
```

### updated

```js
// ✅ DOM 已更新
// ❌ 不要在此修改数据(会导致死循环)
```

### beforeUnmount / unmounted

```js
// ✅ 清理定时器、事件监听、第三方库
onBeforeUnmount(() => {
  clearInterval(timer)
  chart.dispose()
})
```

---

## 3. 父子组件生命周期顺序(高频考点)

### 3.1 挂载阶段

```text
父 beforeCreate
→ 父 created
→ 父 beforeMount
  → 子 beforeCreate
  → 子 created
  → 子 beforeMount
  → 子 mounted
→ 父 mounted
```

**关键**:子组件先完成挂载,父组件才进入 `mounted`。

### 3.2 更新阶段

```text
父 beforeUpdate
→ 子 beforeUpdate
→ 子 updated
→ 父 updated
```

### 3.3 卸载阶段

```text
父 beforeUnmount
→ 子 beforeUnmount
→ 子 unmounted
→ 父 unmounted
```

**面试题**:为什么父组件的 `mounted` 在子组件之后?

**答**:因为父组件的 `mounted` 表示"整个组件树挂载完成",必须等子组件挂载完。

---

## 4. Composition API 的生命周期

### 4.1 setup() 的执行时机

```js
export default {
  setup() {
    console.log('1. setup 开始(相当于 beforeCreate)')

    const count = ref(0)
    console.log('2. 数据初始化(相当于 created)')

    onBeforeMount(() => {
      console.log('3. 挂载前')
    })

    onMounted(() => {
      console.log('4. 挂载完成')
    })

    return { count }
  },
}
```

**重点**:`setup()` 的执行在 `beforeCreate` 和 `created` 之间,所以:

- ✅ 可以访问 props
- ❌ 不能访问 `this`(还未创建)

### 4.2 完整示例

```vue
<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const count = ref(0)

// setup() 顶层代码 = beforeCreate + created
console.log('组件初始化')

onBeforeMount(() => {
  console.log('挂载前')
})

onMounted(() => {
  console.log('挂载完成,可以操作 DOM')
})

onBeforeUpdate(() => {
  console.log('更新前')
})

onUpdated(() => {
  console.log('更新完成')
})

onBeforeUnmount(() => {
  console.log('卸载前,清理资源')
})

onUnmounted(() => {
  console.log('卸载完成')
})
</script>
```

---

## 5. 常见生命周期陷阱

### 陷阱 1:在 created 里操作 DOM

```js
// ❌ 错误
created() {
  this.$refs.myDiv.innerHTML = 'Hello' // $refs 为 undefined
}

// ✅ 正确
mounted() {
  this.$refs.myDiv.innerHTML = 'Hello'
}
```

### 陷阱 2:在 updated 里修改数据导致死循环

```js
// ❌ 死循环!
updated() {
  this.count++ // 触发更新 → updated → 再次触发更新 → ...
}

// ✅ 使用 watch
watch(
  () => someData,
  () => {
    this.count++
  }
)
```

### 陷阱 3:异步获取数据导致的时序问题

```js
// ❌ 可能出问题
async created() {
  this.user = await fetchUser()
  // 如果组件已卸载,这里的赋值会报错
}

// ✅ 正确处理
setup() {
  const user = ref(null)
  const abortController = new AbortController()

  onMounted(async () => {
    user.value = await fetchUser({ signal: abortController.signal })
  })

  onBeforeUnmount(() => {
    abortController.abort() // 取消请求
  })

  return { user }
}
```

### 陷阱 4:在 mounted 里访问子组件 ref

```vue
<template>
  <Child ref="childRef" />
</template>

<script setup>
const childRef = ref(null)

onMounted(() => {
  // ✅ 可以访问,因为子组件先 mounted
  childRef.value.someMethod()
})
</script>
```

---

## 6. keep-alive 的特殊生命周期

### 6.1 activated / deactivated

```vue
<keep-alive>
  <Component :is="currentView" />
</keep-alive>
```

```js
export default {
  activated() {
    console.log('组件被激活(从缓存恢复)')
    // 适合:刷新数据、恢复滚动位置
  },
  deactivated() {
    console.log('组件被停用(进入缓存)')
    // 适合:暂停定时器、保存状态
  },
}
```

**与普通生命周期的区别**:

- 第一次进入:created → mounted → activated
- 缓存后切换:deactivated ↔ activated
- 不会触发:beforeUnmount / unmounted

---

## 7. 服务端渲染(SSR)的生命周期

### 7.1 只在服务端执行

```js
// ✅ SSR 会执行
beforeCreate()
created()
```

### 7.2 只在客户端执行

```js
// ❌ SSR 不执行
beforeMount()
mounted()
// 以及所有更新/卸载钩子
```

**注意**:在 `created` 里不要使用 `window/document`,会报错。

```js
// ❌ SSR 会报错
created() {
  const width = window.innerWidth
}

// ✅ 正确
mounted() {
  const width = window.innerWidth
}
```

---

## 8. 面试高频问题

### Q1:created 和 mounted 的区别?

| 钩子    | DOM 状态 | 适用场景             |
| ------- | -------- | -------------------- |
| created | 未挂载   | 数据初始化、API 请求 |
| mounted | 已挂载   | 操作 DOM、初始化图表 |

### Q2:父子组件挂载顺序?

```text
父 beforeCreate → 父 created → 父 beforeMount
→ 子 beforeCreate → 子 created → 子 beforeMount → 子 mounted
→ 父 mounted
```

### Q3:Composition API 如何替代 beforeCreate 和 created?

直接写在 `setup()` 顶层:

```js
setup() {
  // 这里的代码就相当于 beforeCreate + created
  const data = ref(0)
}
```

### Q4:如何在 setup() 中使用 this?

**不能!** `setup()` 执行时 `this` 还未创建。

替代方案:

```js
import { getCurrentInstance } from 'vue'

setup() {
  const instance = getCurrentInstance()
  console.log(instance.proxy) // 相当于 this
}
```

---

## 9. 总结

**生命周期的核心是"时机"**:

1. **数据可用但 DOM 未就绪**:created / setup()
2. **DOM 就绪**:mounted / onMounted
3. **数据更新后**:updated / onUpdated
4. **清理资源**:unmounted / onUnmounted

**面试答题框架**:

1. **有哪些**:创建/挂载/更新/卸载四个阶段
2. **做什么**:created 请求数据,mounted 操作 DOM
3. **顺序**:子组件先 mounted
4. **注意**:created 没 DOM,updated 别改数据

记住:**在正确的时机做正确的事,是生命周期的核心**。
