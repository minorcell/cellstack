---
title: '组件通信的 7 种方式：从父子到跨层级'
description: '系统梳理 Vue 组件通信的全部方案:props/emit、provide/inject、$attrs/$listeners、EventBus、Vuex/Pinia、$parent/$children,以及各自的适用场景和注意事项'
date: 2025-01-30
order: 3
---

> 组件化开发的核心问题就是:**数据怎么传,事件怎么通知**。
>
> 你可能遇到过这些困惑:
>
> - 深层嵌套组件怎么传数据?逐层 props 太繁琐
> - 兄弟组件怎么通信?通过父组件中转太麻烦
> - 什么时候该用 Vuex?什么时候 provide/inject 就够了?
>
> 这一篇我们把 Vue 的 7 种通信方式讲透,并给出**选择决策树**。

---

## 0. 先给你一句总纲:通信方式的选择取决于"关系"和"复杂度"

| 关系       | 简单场景              | 复杂场景              |
| ---------- | --------------------- | --------------------- |
| 父 → 子    | props                 | props + provide       |
| 子 → 父    | emit                  | emit + inject         |
| 跨层级     | provide/inject        | Vuex/Pinia            |
| 兄弟组件   | 父组件中转/EventBus   | Vuex/Pinia            |
| 全局共享   | Vuex/Pinia            | Vuex/Pinia            |

**核心原则**:

1. **就近原则**:能用 props/emit 就不用 provide
2. **显式优于隐式**:明确的数据流优于全局状态
3. **避免过度设计**:不要一上来就 Vuex

---

## 1. 父 → 子:props(最基础,最常用)

### 1.1 基本用法

```vue
<!-- Parent.vue -->
<template>
  <Child :user="user" :count="count" />
</template>

<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const user = ref({ name: 'Ada', age: 18 })
const count = ref(0)
</script>
```

```vue
<!-- Child.vue -->
<template>
  <div>
    {{ user.name }} - {{ count }}
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
})
</script>
```

### 1.2 props 验证(面试常考)

```js
defineProps({
  // 基础类型检查
  age: Number,

  // 多种类型
  id: [String, Number],

  // 必填
  name: {
    type: String,
    required: true,
  },

  // 默认值
  count: {
    type: Number,
    default: 0,
  },

  // 对象/数组默认值必须用函数返回
  user: {
    type: Object,
    default: () => ({ name: '' }),
  },

  // 自定义验证
  score: {
    type: Number,
    validator: (value) => value >= 0 && value <= 100,
  },
})
```

### 1.3 props 的单向数据流

**规则**:props 是**只读**的,子组件不能直接修改。

```vue
<script setup>
const props = defineProps(['count'])

// ❌ 错误:直接修改 props
props.count++ // 警告!

// ✅ 正确:用本地状态接收
const localCount = ref(props.count)

// ✅ 或者通知父组件修改
const emit = defineEmits(['update:count'])
emit('update:count', props.count + 1)
</script>
```

**为什么要单向数据流?**

1. **可预测**:数据来源清晰,不会"不知道谁改的"
2. **可维护**:避免子组件意外影响父组件
3. **便于调试**:数据流向单一

---

## 2. 子 → 父:emit(事件通知)

### 2.1 基本用法

```vue
<!-- Child.vue -->
<template>
  <button @click="handleClick">点击</button>
</template>

<script setup>
const emit = defineEmits(['update', 'delete'])

const handleClick = () => {
  emit('update', { id: 1, name: 'New' })
}
</script>
```

```vue
<!-- Parent.vue -->
<template>
  <Child @update="handleUpdate" @delete="handleDelete" />
</template>

<script setup>
const handleUpdate = (payload) => {
  console.log('子组件传来的数据:', payload)
}

const handleDelete = () => {
  console.log('删除事件')
}
</script>
```

### 2.2 v-model 双向绑定(语法糖)

Vue 3 的 `v-model` 本质是 `props + emit` 的组合:

```vue
<!-- 使用 v-model -->
<CustomInput v-model="value" />

<!-- 等价于 -->
<CustomInput :modelValue="value" @update:modelValue="value = $event" />
```

**实现自定义 v-model**:

```vue
<!-- CustomInput.vue -->
<template>
  <input :value="modelValue" @input="handleInput" />
</template>

<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>
```

**多个 v-model**:

```vue
<UserForm v-model:name="name" v-model:email="email" />

<!-- 组件内 -->
<script setup>
defineProps(['name', 'email'])
const emit = defineEmits(['update:name', 'update:email'])
</script>
```

---

## 3. 跨层级:provide/inject(依赖注入)

### 3.1 基本用法

适用于**祖先组件 → 深层子孙组件**,避免逐层 props。

```vue
<!-- Grandparent.vue -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
const user = ref({ name: 'Ada' })

// 提供数据
provide('theme', theme)
provide('user', user)
</script>
```

```vue
<!-- Deeply nested Child.vue -->
<script setup>
import { inject } from 'vue'

// 注入数据
const theme = inject('theme')
const user = inject('user')

// 设置默认值
const config = inject('config', { mode: 'production' })
</script>
```

### 3.2 响应式注入

**关键**:provide 传递的 `ref/reactive` 会保持响应式!

```vue
<!-- Provider -->
<script setup>
import { provide, ref } from 'vue'

const count = ref(0)
provide('count', count)

// 子孙组件读取 count 时是响应式的
</script>
```

```vue
<!-- Consumer -->
<script setup>
import { inject } from 'vue'

const count = inject('count')
// count 的变化会触发更新
</script>
```

### 3.3 provide/inject 的修改规则

**最佳实践**:谁提供数据,谁负责修改。

```vue
<!-- Provider -->
<script setup>
import { provide, ref } from 'vue'

const count = ref(0)
const increment = () => count.value++

// 同时提供数据和修改方法
provide('count', { count, increment })
</script>
```

```vue
<!-- Consumer -->
<script setup>
import { inject } from 'vue'

const { count, increment } = inject('count')
</script>
```

### 3.4 何时用 provide/inject?

**适用场景**:

1. **主题/语言切换**:全局配置
2. **表单组件库**:Form 向 FormItem 传递验证规则
3. **布局组件**:Container 向子组件传递尺寸

**不适用**:

- 兄弟组件通信(用 Vuex/Pinia)
- 需要严格数据流追踪(provide 是隐式的,不易调试)

---

## 4. 透传属性:$attrs 和 $listeners(Vue 2)

### 4.1 $attrs:透传未声明的 props

```vue
<!-- Parent.vue -->
<Child id="app" class="container" data-test="foo" />
```

```vue
<!-- Child.vue -->
<template>
  <!-- 自动继承到根元素 -->
  <div>
    <!-- 输出: <div id="app" class="container" data-test="foo"> -->
  </div>
</template>

<script setup>
// 如果不想自动继承,设置 inheritAttrs: false
defineOptions({
  inheritAttrs: false,
})

// 手动绑定
const attrs = useAttrs()
</script>
```

```vue
<template>
  <!-- 手动指定绑定位置 -->
  <div>
    <input v-bind="$attrs" />
  </div>
</template>
```

### 4.2 常见用途:封装第三方组件

```vue
<!-- MyButton.vue -->
<template>
  <button v-bind="$attrs" class="my-button">
    <slot />
  </button>
</template>

<script setup>
defineOptions({
  inheritAttrs: false, // 不自动继承
})
</script>
```

使用:

```vue
<MyButton id="btn" disabled @click="handleClick"> 点击 </MyButton>

<!-- 渲染为 -->
<button id="btn" disabled class="my-button">点击</button>
```

---

## 5. 兄弟组件:EventBus(事件总线)

### 5.1 Vue 2 的实现

```js
// eventBus.js
import Vue from 'vue'
export const EventBus = new Vue()
```

```vue
<!-- ComponentA.vue -->
<script>
import { EventBus } from './eventBus'

export default {
  methods: {
    sendMsg() {
      EventBus.$emit('message', 'Hello from A')
    },
  },
}
</script>
```

```vue
<!-- ComponentB.vue -->
<script>
import { EventBus } from './eventBus'

export default {
  mounted() {
    EventBus.$on('message', (msg) => {
      console.log(msg)
    })
  },
  beforeUnmount() {
    EventBus.$off('message') // 记得移除监听!
  },
}
</script>
```

### 5.2 Vue 3 的替代方案

Vue 3 移除了 `$on/$off`,推荐用第三方库 `mitt`:

```bash
npm install mitt
```

```js
// eventBus.js
import mitt from 'mitt'
export const emitter = mitt()
```

```vue
<script setup>
import { onUnmounted } from 'vue'
import { emitter } from './eventBus'

// 发送事件
const sendMsg = () => {
  emitter.emit('message', 'Hello')
}

// 接收事件
const handleMessage = (msg) => console.log(msg)
emitter.on('message', handleMessage)

// 组件卸载时移除
onUnmounted(() => {
  emitter.off('message', handleMessage)
})
</script>
```

### 5.3 EventBus 的问题

1. **难以追踪**:不知道事件从哪里发出
2. **容易内存泄漏**:忘记 `off` 会导致监听器累积
3. **不适合复杂场景**:多个组件监听同一事件容易混乱

**推荐**:简单场景用 EventBus,复杂场景用 Vuex/Pinia。

---

## 6. 全局状态:Vuex vs Pinia

### 6.1 Vuex 的核心概念

```js
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    count: 0,
    user: null,
  },
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    SET_USER(state, user) {
      state.user = user
    },
  },
  actions: {
    async fetchUser({ commit }, id) {
      const user = await api.getUser(id)
      commit('SET_USER', user)
    },
  },
})
```

**使用**:

```vue
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const count = computed(() => store.state.count)
const doubleCount = computed(() => store.getters.doubleCount)

const increment = () => store.commit('INCREMENT')
const fetchUser = (id) => store.dispatch('fetchUser', id)
</script>
```

### 6.2 Pinia 的优势(Vue 3 推荐)

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
    async fetchUser(id) {
      this.user = await api.getUser(id)
    },
  },
})
```

**使用**:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 直接访问
console.log(counter.count)
console.log(counter.doubleCount)

// 直接调用
counter.increment()
</script>
```

**Pinia vs Vuex**:

| 特性           | Vuex                     | Pinia                 |
| -------------- | ------------------------ | --------------------- |
| TypeScript     | 支持,但类型推断弱        | 完美支持              |
| mutations      | 必须通过 commit          | 无需,直接修改 state   |
| 模块化         | 需要手动配置 modules     | 自动模块化            |
| 组合式 API     | 需要辅助函数             | 原生支持              |
| DevTools       | 支持                     | 支持                  |

**推荐**:新项目用 Pinia,老项目 Vuex 也够用。

---

## 7. 直接访问:$parent/$children/$refs(不推荐,但要知道)

### 7.1 $parent 和 $refs

```vue
<!-- Parent.vue -->
<template>
  <Child ref="childRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const childRef = ref(null)

onMounted(() => {
  // 调用子组件方法
  childRef.value.someMethod()
})
</script>
```

```vue
<!-- Child.vue -->
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()

// 访问父组件(不推荐)
console.log(instance.parent)

// 暴露方法给父组件
defineExpose({
  someMethod() {
    console.log('被父组件调用')
  },
})
</script>
```

### 7.2 为什么不推荐?

1. **耦合性强**:组件依赖特定的父子关系
2. **不利于复用**:换个位置就可能出错
3. **难以追踪**:数据流不清晰

**适用场景**:

- 紧密耦合的组件(如 Form 和 FormItem)
- 需要直接操作子组件实例(如调用 focus)

---

## 8. 通信方式选择决策树

```text
需要通信的组件关系?
│
├─ 父子组件
│  ├─ 父 → 子: props
│  └─ 子 → 父: emit
│
├─ 跨 2-3 层
│  └─ provide/inject
│
├─ 跨多层/全局
│  ├─ 简单配置: provide/inject
│  └─ 复杂状态: Vuex/Pinia
│
├─ 兄弟组件
│  ├─ 简单通信: 通过父组件中转(emit + props)
│  ├─ 频繁通信: EventBus(mitt)
│  └─ 共享状态: Vuex/Pinia
│
└─ 任意组件
   └─ Vuex/Pinia
```

---

## 9. 面试高频问题汇总

### Q1:Vue 组件通信有哪些方式?

1. **props/emit**:父子组件
2. **provide/inject**:祖先后代
3. **$attrs**:透传属性
4. **EventBus**:任意组件(Vue 2)
5. **Vuex/Pinia**:全局状态
6. **$parent/$refs**:直接访问(不推荐)
7. **$root**:根实例(极少用)

### Q2:provide/inject 和 Vuex 有什么区别?

| 特性       | provide/inject       | Vuex/Pinia          |
| ---------- | -------------------- | ------------------- |
| 作用域     | 组件树局部           | 全局                |
| 数据流     | 隐式(不易追踪)       | 显式(易调试)        |
| DevTools   | 不支持               | 支持                |
| 适用场景   | 组件库内部、主题配置 | 跨页面/模块共享状态 |

### Q3:为什么 Vue 3 移除了 EventBus?

1. **难以维护**:事件来源不明确
2. **容易泄漏**:忘记移除监听器
3. **有更好方案**:Pinia 更适合复杂场景

### Q4:v-model 的原理是什么?

```vue
<Child v-model="value" />

<!-- 等价于 -->
<Child :modelValue="value" @update:modelValue="value = $event" />
```

**本质**:props + emit 的语法糖。

---

## 10. 总结:通信的核心是"数据流清晰"

**好的通信方式**:

1. **显式优于隐式**:明确的 props/emit 优于全局变量
2. **就近原则**:能用局部方案就不用全局
3. **单向数据流**:父 → 子传数据,子 → 父发事件

**面试答题框架**:

1. **父子**:props + emit
2. **跨层**:provide/inject
3. **兄弟**:父组件中转 / EventBus / Vuex
4. **全局**:Vuex/Pinia

记住:**好的组件通信设计,让数据流一目了然**。
