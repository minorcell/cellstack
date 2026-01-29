---
title: 'computed vs watch：响应式计算的最佳实践'
description: '深入对比 computed 和 watch 的实现原理、缓存机制、性能差异,以及如何根据场景选择:computed 擅长派生状态,watch 擅长副作用'
date: 2025-01-30
order: 5
---

> 很多人分不清 computed 和 watch 的使用场景:
>
> - 什么时候用 computed?什么时候用 watch?
> - computed 的缓存机制是怎么回事?
> - watch 的 deep 和 immediate 有什么坑?
>
> 这一篇我们把两者的**原理、性能、适用场景**讲透。

---

## 1. computed:计算属性的核心是"缓存"

### 1.1 基本用法

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('Ada')
const lastName = ref('Lovelace')

// 计算属性
const fullName = computed(() => {
  console.log('computed 执行')
  return `${firstName.value} ${lastName.value}`
})
</script>

<template>
  <div>{{ fullName }}</div>
  <div>{{ fullName }}</div>
  <!-- computed 只执行一次,第二次直接用缓存 -->
</template>
```

### 1.2 computed 的缓存机制

**关键**:只有依赖的响应式数据变化时,才会重新计算。

```js
const count = ref(0)
const double = computed(() => {
  console.log('计算')
  return count.value * 2
})

console.log(double.value) // 输出: 计算 0
console.log(double.value) // 直接用缓存,不输出
count.value++
console.log(double.value) // 输出: 计算 2
```

**对比 methods**:

```js
// ❌ 每次调用都执行
methods: {
  getDouble() {
    console.log('执行')
    return this.count * 2
  }
}

// 模板中每次渲染都会调用两次
<div>{{ getDouble() }}</div>
<div>{{ getDouble() }}</div>
```

---

## 2. watch:侦听器的核心是"副作用"

### 2.1 基本用法

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个值
watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

// 侦听多个值
watch([count, anotherRef], ([newCount, newAnother], [oldCount, oldAnother]) => {
  console.log('count 或 anotherRef 变化了')
})

// 侦听对象属性
const user = reactive({ name: 'Ada', age: 18 })
watch(
  () => user.age,
  (newAge) => {
    console.log('age 变化:', newAge)
  }
)
</script>
```

### 2.2 watch 的三大选项

#### immediate:立即执行

```js
watch(
  count,
  (val) => {
    console.log(val)
  },
  { immediate: true }
)
// 组件挂载时立即执行一次,输出当前值
```

#### deep:深度监听

```js
const user = reactive({
  profile: {
    name: 'Ada',
  },
})

// ❌ 不会触发(只监听对象引用)
watch(user, () => {
  console.log('user 变化')
})
user.profile.name = 'Bob' // 不触发

// ✅ 深度监听
watch(
  user,
  () => {
    console.log('user 或其属性变化')
  },
  { deep: true }
)
user.profile.name = 'Bob' // 触发
```

**注意**:`reactive` 对象默认就是深度监听的!

```js
const user = reactive({ name: 'Ada' })

// 自动深度监听,不需要 deep: true
watch(user, () => {
  console.log('user 属性变化')
})
```

#### flush:执行时机

```js
watch(
  count,
  () => {
    // 访问更新后的 DOM
  },
  { flush: 'post' } // 在 DOM 更新后执行
)

// 默认 flush: 'pre',在 DOM 更新前执行
```

---

## 3. computed vs watch:如何选择?

### 3.1 决策树

```text
需要派生一个新的响应式值?
  ✅ 用 computed

需要执行异步操作/副作用?
  ✅ 用 watch

需要根据多个值计算结果,且在模板中使用?
  ✅ 用 computed

需要监听数据变化,触发API请求/操作DOM?
  ✅ 用 watch
```

### 3.2 典型场景对比

#### 场景 1:过滤列表

```js
// ✅ 推荐:computed
const filteredList = computed(() => {
  return list.value.filter((item) => item.active)
})

// ❌ 不推荐:watch(需要手动维护状态)
const filteredList = ref([])
watch(list, (newList) => {
  filteredList.value = newList.filter((item) => item.active)
})
```

#### 场景 2:搜索防抖

```js
// ✅ 推荐:watch(需要副作用)
import { debounce } from 'lodash-es'

const searchText = ref('')
const searchResults = ref([])

watch(
  searchText,
  debounce(async (text) => {
    searchResults.value = await api.search(text)
  }, 300)
)

// ❌ 不推荐:computed(不支持异步)
```

#### 场景 3:计算总价

```js
// ✅ 推荐:computed
const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})
```

---

## 4. computed 的高级用法

### 4.1 可写的 computed

```vue
<script setup>
const firstName = ref('Ada')
const lastName = ref('Lovelace')

const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value) {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last
  },
})

fullName.value = 'Grace Hopper' // 会更新 firstName 和 lastName
</script>
```

### 4.2 computed 的依赖收集原理

```js
const count = ref(0)
const flag = ref(true)

const result = computed(() => {
  // 只有 flag 为 true 时,才依赖 count
  if (flag.value) {
    return count.value * 2
  }
  return 0
})

// flag = true 时,修改 count 会触发重新计算
count.value++ // 触发

// flag = false 时,修改 count 不会触发
flag.value = false
count.value++ // 不触发
```

**原理**:computed 每次执行时,重新收集依赖。

---

## 5. watch 的高级用法

### 5.1 watchEffect:自动收集依赖

```js
import { ref, watchEffect } from 'vue'

const count = ref(0)
const double = ref(0)

// 不需要显式指定依赖
watchEffect(() => {
  double.value = count.value * 2
  console.log('count 或 double 变化')
})

// 等价于
watch(
  [count, double],
  () => {
    double.value = count.value * 2
    console.log('count 或 double 变化')
  },
  { immediate: true }
)
```

**区别**:

| 特性       | watch                    | watchEffect           |
| ---------- | ------------------------ | --------------------- |
| 依赖声明   | 显式指定                 | 自动收集              |
| 旧值       | 可以访问 oldValue        | 不可以                |
| 立即执行   | 默认 false,需要 immediate| 默认 true             |

### 5.2 停止监听

```js
const stop = watch(count, () => {
  console.log('count 变化')
})

// 手动停止
stop()
```

### 5.3 watch 的清理副作用

```js
watch(searchText, async (newText, oldText, onCleanup) => {
  let cancelled = false

  // 注册清理函数
  onCleanup(() => {
    cancelled = true
  })

  const result = await api.search(newText)

  // 如果已经被新的 watch 清理,不更新结果
  if (!cancelled) {
    searchResults.value = result
  }
})
```

**场景**:快速输入时,取消上一次的搜索请求。

---

## 6. 性能对比

### 6.1 computed 的性能优势

```js
// ❌ 性能差:每次渲染都计算
<template>
  <div>{{ list.filter(item => item.active).length }}</div>
  <div>{{ list.filter(item => item.active)[0] }}</div>
  <!-- filter 执行了两次 -->
</template>

// ✅ 性能好:只计算一次
<script setup>
const activeList = computed(() => list.value.filter(item => item.active))
</script>

<template>
  <div>{{ activeList.length }}</div>
  <div>{{ activeList[0] }}</div>
</template>
```

### 6.2 watch deep 的性能开销

```js
const bigObject = reactive({
  level1: {
    level2: {
      level3: {
        value: 1,
      },
    },
  },
})

// ❌ 性能差:遍历整个对象
watch(bigObject, () => {}, { deep: true })

// ✅ 性能好:只监听需要的属性
watch(
  () => bigObject.level1.level2.level3.value,
  () => {}
)
```

---

## 7. 常见陷阱

### 陷阱 1:在 computed 里修改其他状态

```js
// ❌ 副作用应该用 watch
const fullName = computed(() => {
  logCount.value++ // 不要这样!
  return `${firstName.value} ${lastName.value}`
})

// ✅ 正确
watch([firstName, lastName], () => {
  logCount.value++
})
```

### 陷阱 2:watch 一个 computed

```js
const count = ref(0)
const double = computed(() => count.value * 2)

// ❌ 不推荐(多一层包装)
watch(double, (val) => {
  console.log(val)
})

// ✅ 推荐(直接 watch 原始值)
watch(count, (val) => {
  console.log(val * 2)
})
```

### 陷阱 3:watch 数组需要深拷贝旧值

```js
const list = ref([1, 2, 3])

watch(list, (newList, oldList) => {
  console.log(newList === oldList) // true!
  // 因为数组是引用类型,newList 和 oldList 指向同一个对象
})

// 解决:deep watch 或 手动拷贝
watch(
  () => [...list.value],
  (newList, oldList) => {
    console.log(newList === oldList) // false
  }
)
```

---

## 8. 面试高频问题

### Q1:computed 和 watch 的区别?

| 特性     | computed                  | watch                      |
| -------- | ------------------------- | -------------------------- |
| 用途     | 计算派生值                | 执行副作用(异步/DOM 操作)  |
| 缓存     | 有缓存                    | 无缓存                     |
| 返回值   | 必须返回值                | 无返回值                   |
| 异步     | 不支持                    | 支持                       |

### Q2:computed 的缓存原理?

基于**依赖追踪**:

1. 首次访问时执行,收集依赖
2. 依赖未变化,返回缓存值
3. 依赖变化,标记为 dirty,下次访问时重新计算

### Q3:什么时候用 watchEffect?

1. **不关心旧值**
2. **需要立即执行**
3. **依赖是动态的**(条件依赖)

### Q4:watch 的 deep 有什么缺点?

1. **性能开销**:递归遍历整个对象
2. **无法获取具体变化的属性**
3. **建议**:明确监听需要的属性

---

## 9. 总结

**选择原则**:

1. **派生值** → computed
2. **副作用** → watch
3. **自动依赖** → watchEffect

**面试答题框架**:

1. **是什么**:computed 计算属性,watch 侦听器
2. **区别**:computed 有缓存且返回值,watch 执行副作用
3. **何时用**:计算用 computed,异步/DOM 用 watch
4. **注意**:deep 性能,computed 不要副作用

记住:**computed 是"结果",watch 是"过程"**。
