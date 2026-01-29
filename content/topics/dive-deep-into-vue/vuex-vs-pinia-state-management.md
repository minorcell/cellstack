---
title: 'Vuex vs Pinia：状态管理的演进'
description: '深入对比 Vuex 和 Pinia 的设计理念、核心概念、TypeScript 支持,以及如何选择合适的状态管理方案'
date: 2025-01-30
order: 9
---

> 状态管理是中大型项目的必备技能,但很多人会困惑:
>
> - 什么时候需要状态管理?组件通信不够吗?
> - Vuex 的 mutations 和 actions 有什么区别?
> - Pinia 比 Vuex 好在哪里?要不要迁移?
>
> 这一篇我们把 **Vuex 核心概念、Pinia 优势、选择策略** 讲透。

---

## 1. 为什么需要状态管理?

### 1.1 组件通信的局限

**场景**:用户信息需要在多个页面共享

```text
App
├─ Header (显示用户名)
├─ Sidebar (显示头像)
└─ Main
   ├─ Profile (编辑用户信息)
   └─ Settings (显示用户设置)
```

**问题**:

- Header 和 Sidebar 是兄弟组件,通信困难
- Profile 修改数据后,Header/Sidebar 如何知道?
- 逐层 props/emit 太繁琐

### 1.2 状态管理的解决方案

**集中式管理**:

```js
// 所有组件共享同一个 store
const store = {
  state: { user: { name: 'Ada', avatar: 'xxx' } },
}

// Header 读取
computed(() => store.state.user.name)

// Profile 修改
store.state.user.name = 'Bob'
// Header 自动更新(响应式)
```

**优势**:

- ✅ 单一数据源
- ✅ 数据流清晰
- ✅ 便于调试(DevTools)
- ✅ 可预测的状态变更

---

## 2. Vuex 核心概念详解

### 2.1 四大核心:State/Getters/Mutations/Actions

```js
import { createStore } from 'vuex'

const store = createStore({
  // 1. State:数据源
  state: {
    count: 0,
    user: null,
  },

  // 2. Getters:计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
    isLogin: (state) => state.user !== null,
  },

  // 3. Mutations:同步修改 state(唯一方式)
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    SET_USER(state, user) {
      state.user = user
    },
  },

  // 4. Actions:异步操作,提交 mutation
  actions: {
    async login({ commit }, credentials) {
      const user = await api.login(credentials)
      commit('SET_USER', user)
    },
    increment({ commit }) {
      // 也可以处理同步逻辑
      commit('INCREMENT')
    },
  },
})
```

### 2.2 为什么要区分 Mutations 和 Actions?

**Mutations**:

- ✅ 必须是同步函数
- ✅ 直接修改 state
- ✅ DevTools 可以追踪每次变更

**Actions**:

- ✅ 可以是异步函数
- ✅ 不直接修改 state,通过 commit 提交 mutation
- ✅ 可以包含复杂的业务逻辑

**示例**:

```js
// ❌ 错误:在 mutation 中异步修改
mutations: {
  async SET_USER(state, userId) {
    const user = await api.getUser(userId) // 异步!
    state.user = user
    // DevTools 无法正确追踪
  }
}

// ✅ 正确:在 action 中异步,在 mutation 中同步修改
actions: {
  async fetchUser({ commit }, userId) {
    const user = await api.getUser(userId)
    commit('SET_USER', user)
  }
},
mutations: {
  SET_USER(state, user) {
    state.user = user
  }
}
```

### 2.3 在组件中使用 Vuex

**Options API**:

```vue
<template>
  <div>
    <p>{{ count }}</p>
    <p>{{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['count']),
    ...mapGetters(['doubleCount']),
  },
  methods: {
    ...mapMutations(['INCREMENT']),
    ...mapActions(['increment']),
  },
}
</script>
```

**Composition API**:

```vue
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const count = computed(() => store.state.count)
const doubleCount = computed(() => store.getters.doubleCount)

const increment = () => store.dispatch('increment')
</script>
```

### 2.4 模块化(Modules)

```js
// modules/user.js
export default {
  namespaced: true, // 开启命名空间
  state: {
    profile: null,
  },
  getters: {
    fullName: (state) => `${state.profile.firstName} ${state.profile.lastName}`,
  },
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    },
  },
  actions: {
    async fetchProfile({ commit }) {
      const profile = await api.getProfile()
      commit('SET_PROFILE', profile)
    },
  },
}
```

```js
// store/index.js
import { createStore } from 'vuex'
import user from './modules/user'
import cart from './modules/cart'

export default createStore({
  modules: {
    user,
    cart,
  },
})
```

**使用**:

```js
// 读取
store.state.user.profile
store.getters['user/fullName']

// 修改
store.commit('user/SET_PROFILE', profile)
store.dispatch('user/fetchProfile')
```

---

## 3. Pinia:新一代状态管理

### 3.1 Pinia 的设计理念

Pinia 是 Vue 3 官方推荐的状态管理库,核心理念:

- ✅ **简化 API**:去除 mutations,只保留 state/getters/actions
- ✅ **TypeScript 友好**:完美的类型推导
- ✅ **模块化**:每个 store 都是独立的
- ✅ **Devtools 支持**:时间旅行、状态快照

### 3.2 基本用法

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // State
  state: () => ({
    count: 0,
  }),

  // Getters
  getters: {
    doubleCount: (state) => state.count * 2,
  },

  // Actions
  actions: {
    increment() {
      this.count++
    },
    async fetchCount() {
      this.count = await api.getCount()
    },
  },
})
```

**在组件中使用**:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 读取
console.log(counter.count)
console.log(counter.doubleCount)

// 修改
counter.increment()
counter.count++ // ✅ 直接修改也可以!
</script>
```

### 3.3 Setup Store 写法(推荐)

```js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)

  // Getters
  const doubleCount = computed(() => count.value * 2)

  // Actions
  function increment() {
    count.value++
  }

  async function fetchCount() {
    count.value = await api.getCount()
  }

  return { count, doubleCount, increment, fetchCount }
})
```

**优势**:

- ✅ 更符合 Composition API 的写法
- ✅ 更灵活(可以使用任何组合式函数)
- ✅ 类型推导更好

---

## 4. Vuex vs Pinia 深度对比

### 4.1 核心概念对比

| 特性           | Vuex                    | Pinia                  |
| -------------- | ----------------------- | ---------------------- |
| Mutations      | 必须通过 commit         | 无需,直接修改 state    |
| Actions        | 通过 dispatch 调用      | 直接调用方法           |
| 模块化         | 手动配置 modules        | 自动模块化             |
| TypeScript     | 需要手动定义类型        | 自动类型推导           |
| 命名空间       | 需要 `namespaced: true` | 自动按 store 隔离      |
| DevTools       | 支持                    | 支持(更强大)           |
| 体积           | 较大(~22KB)             | 较小(~1KB)             |

### 4.2 代码对比

**同样的功能,Vuex vs Pinia**:

```js
// Vuex
const store = createStore({
  state: { count: 0 },
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  mutations: {
    INCREMENT(state) {
      state.count++
    },
  },
  actions: {
    increment({ commit }) {
      commit('INCREMENT')
    },
  },
})

// 使用
store.commit('INCREMENT')
store.dispatch('increment')
```

```js
// Pinia
const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++ // 直接修改!
    },
  },
})

// 使用
const counter = useCounterStore()
counter.increment()
counter.count++ // 也可以直接改
```

### 4.3 TypeScript 支持对比

**Vuex**:

```ts
// 需要手动定义类型
interface State {
  count: number
}

const store = createStore<State>({
  state: { count: 0 },
})

// 使用时类型推导较弱
store.state.count // 类型: number
store.getters.doubleCount // 类型: any (需要手动定义)
```

**Pinia**:

```ts
// 自动类型推导
const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
})

const counter = useCounterStore()
counter.count // 自动推导为 number
counter.doubleCount // 自动推导为 number
```

---

## 5. Pinia 的高级用法

### 5.1 Store 之间的互相访问

```js
// stores/user.js
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  return { user }
})

// stores/cart.js
export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const userStore = useUserStore() // 访问其他 store

  const checkout = async () => {
    await api.checkout({
      userId: userStore.user.id, // 使用其他 store 的数据
      items: items.value,
    })
  }

  return { items, checkout }
})
```

### 5.2 插件系统

```js
import { createPinia } from 'pinia'

const pinia = createPinia()

// 持久化插件
pinia.use(({ store }) => {
  // 读取 localStorage
  const saved = localStorage.getItem(store.$id)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }

  // 监听变化,保存到 localStorage
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
})
```

### 5.3 订阅 State 变化

```js
const counter = useCounterStore()

// 订阅整个 state
counter.$subscribe((mutation, state) => {
  console.log('State 变化:', state)
})

// 订阅 action
counter.$onAction(({ name, args, after, onError }) => {
  console.log(`开始执行 ${name}`)

  after((result) => {
    console.log(`${name} 执行完成`)
  })

  onError((error) => {
    console.log(`${name} 执行出错:`, error)
  })
})
```

### 5.4 重置 State

```js
const counter = useCounterStore()

counter.count = 10

// 重置为初始值
counter.$reset() // count 变回 0
```

---

## 6. 什么时候需要状态管理?

### 6.1 需要使用的场景

✅ **用户信息**:登录状态、个人资料
✅ **购物车**:跨页面共享
✅ **全局配置**:主题、语言
✅ **复杂表单**:多步骤表单
✅ **实时数据**:WebSocket 消息

### 6.2 不需要使用的场景

❌ **简单应用**:几个页面,状态简单
❌ **临时状态**:弹窗显示/隐藏
❌ **组件内部状态**:表单输入值
❌ **父子组件通信**:props/emit 够用

### 6.3 决策树

```text
状态是否被多个页面共享?
  No → 用 ref/reactive
  Yes ↓

是否需要持久化?
  Yes → Pinia + 插件
  No ↓

逻辑是否复杂?
  Yes → Pinia
  No → provide/inject
```

---

## 7. 从 Vuex 迁移到 Pinia

### 7.1 迁移步骤

**Vuex**:

```js
// store/index.js
const store = createStore({
  state: { count: 0 },
  mutations: {
    INCREMENT(state) {
      state.count++
    },
  },
  actions: {
    increment({ commit }) {
      commit('INCREMENT')
    },
  },
})
```

**迁移到 Pinia**:

```js
// stores/counter.js
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++ // 合并 mutation 和 action
    },
  },
})
```

### 7.2 渐进式迁移

可以让 Vuex 和 Pinia 共存:

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import store from './store' // Vuex

const app = createApp(App)

app.use(store) // Vuex
app.use(createPinia()) // Pinia

// 组件中可以同时使用两者
```

---

## 8. 面试高频问题

### Q1:Vuex 的 mutations 和 actions 有什么区别?

| 特性     | Mutations            | Actions              |
| -------- | -------------------- | -------------------- |
| 同步/异步| 必须同步             | 可以异步             |
| 职责     | 修改 state           | 业务逻辑             |
| 调用方式 | commit               | dispatch             |
| DevTools | 可追踪               | 不可追踪             |

**为什么要区分?**

- Mutations 同步,DevTools 可以准确记录每次状态变更
- Actions 处理异步,完成后再 commit mutation

### Q2:Pinia 比 Vuex 好在哪里?

1. **更简单**:去除 mutations,API 更少
2. **更好的 TS 支持**:自动类型推导
3. **更小的体积**:1KB vs 22KB
4. **更灵活**:Setup Store 写法,可使用组合式函数
5. **自动模块化**:无需手动配置命名空间

### Q3:什么时候需要状态管理?

**需要**:

- 多个组件共享状态
- 状态需要持久化
- 复杂的状态逻辑

**不需要**:

- 简单应用
- 组件内部状态
- 父子组件通信

### Q4:如何在 Pinia 中实现持久化?

```js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 使用
export const useUserStore = defineStore('user', {
  state: () => ({ user: null }),
  persist: true, // 开启持久化
})
```

---

## 9. 最佳实践

### 9.1 Store 拆分原则

```text
stores/
├── user.js      # 用户相关
├── cart.js      # 购物车
├── product.js   # 商品
└── config.js    # 全局配置
```

**原则**:

- ✅ 按业务领域拆分
- ✅ 单一职责
- ✅ 避免 Store 过大

### 9.2 Action 命名规范

```js
export const useUserStore = defineStore('user', {
  actions: {
    // ✅ 推荐:动词开头
    fetchUser() {},
    updateProfile() {},
    deleteAccount() {},

    // ❌ 不推荐:名词
    user() {},
    profile() {},
  },
})
```

### 9.3 避免在 Store 中存放大量数据

```js
// ❌ 不推荐:存放整个列表
const useProductStore = defineStore('product', {
  state: () => ({
    allProducts: [], // 如果有 10000 个商品,很占内存
  }),
})

// ✅ 推荐:只存放必要数据,其他从 API 获取
const useProductStore = defineStore('product', {
  state: () => ({
    currentProduct: null,
  }),
  actions: {
    async fetchProduct(id) {
      this.currentProduct = await api.getProduct(id)
    },
  },
})
```

---

## 10. 总结

**Vuex vs Pinia**:

| 场景           | 推荐方案  |
| -------------- | --------- |
| Vue 3 新项目   | Pinia     |
| Vue 2 项目     | Vuex      |
| 大型项目       | Pinia     |
| 需要 TS 支持   | Pinia     |
| 已有 Vuex 代码 | 渐进迁移  |

**面试答题框架**:

1. **是什么**:集中式状态管理
2. **为什么**:多组件共享状态、数据流清晰
3. **怎么用**:Vuex(state/mutations/actions)、Pinia(更简洁)
4. **注意**:不是所有状态都需要管理,避免过度设计

记住:**状态管理是工具,不是必需品。只在需要时使用,才能发挥最大价值**。
