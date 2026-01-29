---
title: 'keep-alive 缓存机制：组件复用的艺术'
description: '深入理解 keep-alive 的缓存策略(LRU)、activated/deactivated 生命周期、include/exclude 配置,以及与路由配合的最佳实践'
date: 2025-01-30
order: 8
---

> 你肯定遇到过这些场景:
>
> - 列表页滚动到底部,点击详情后返回,列表回到顶部了
> - 表单填了一半,切换 tab 后数据丢失了
> - 多个 tab 频繁切换,每次都重新请求数据,很卡
>
> 这些问题都可以用 **keep-alive** 解决。这一篇我们把 **缓存策略、生命周期、配置技巧** 讲透。

---

## 1. keep-alive 是什么?为什么需要它?

### 1.1 问题场景

**没有 keep-alive 时**:

```vue
<template>
  <component :is="currentView" />
</template>

<script setup>
const currentView = ref('ComponentA')

// 切换组件
const switchView = () => {
  currentView.value = 'ComponentB' // ComponentA 被销毁
}
</script>
```

**问题**:

1. 切换时,旧组件被销毁,状态丢失
2. 再次切换回来,组件重新创建,数据重新请求
3. 用户输入、滚动位置等状态无法保留

### 1.2 使用 keep-alive 后

```vue
<keep-alive>
  <component :is="currentView" />
</keep-alive>
```

**效果**:

- ✅ 组件不被销毁,缓存在内存中
- ✅ 切换时只是隐藏/显示
- ✅ 状态、数据、滚动位置都保留

---

## 2. keep-alive 的核心原理

### 2.1 缓存策略:LRU(最近最少使用)

keep-alive 内部维护一个 **缓存对象** 和 **key 数组**:

```js
// 简化版实现
const cache = new Map() // 缓存的组件实例
const keys = new Set() // 缓存的 key 集合

function cacheComponent(key, vnode) {
  if (cache.size >= max) {
    // 达到最大缓存数,删除最久未使用的
    const oldestKey = keys.values().next().value
    cache.delete(oldestKey)
    keys.delete(oldestKey)
  }

  cache.set(key, vnode)
  keys.delete(key) // 先删除
  keys.add(key) // 再添加到末尾,保持最新
}
```

**LRU 策略**:

1. 每次访问组件,把它的 key 移到队列末尾
2. 队列头部是最久未使用的
3. 超过 max 时,删除队列头部

### 2.2 组件的 key 是如何生成的?

```js
// Vue 内部生成 key 的逻辑
function getComponentKey(vnode) {
  // 1. 如果手动设置了 key
  if (vnode.key != null) {
    return vnode.key
  }

  // 2. 动态组件使用组件名
  if (vnode.type.name) {
    return vnode.type.name
  }

  // 3. 使用组件构造函数的 cid
  return vnode.type
}
```

**重要**:动态组件需要确保每个组件有 **唯一的 name**!

---

## 3. activated / deactivated 生命周期

### 3.1 完整的生命周期流程

**首次进入组件**:

```text
beforeCreate → created → beforeMount → mounted → activated
```

**切换离开**:

```text
deactivated (不触发 beforeUnmount / unmounted)
```

**再次进入**:

```text
activated (不触发 beforeCreate / created / mounted)
```

### 3.2 使用示例

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

let timer = null

onActivated(() => {
  console.log('组件被激活(从缓存恢复)')

  // ✅ 适合:刷新数据、恢复定时器
  fetchLatestData()
  timer = setInterval(() => {
    updateData()
  }, 1000)
})

onDeactivated(() => {
  console.log('组件被停用(进入缓存)')

  // ✅ 适合:暂停定时器、保存状态
  clearInterval(timer)
  saveScrollPosition()
})
</script>
```

### 3.3 Options API 写法

```js
export default {
  activated() {
    console.log('组件激活')
  },
  deactivated() {
    console.log('组件停用')
  },
}
```

---

## 4. include / exclude / max 配置

### 4.1 include:缓存白名单

```vue
<!-- 只缓存 name 为 ComponentA 和 ComponentB 的组件 -->
<keep-alive include="ComponentA,ComponentB">
  <component :is="currentView" />
</keep-alive>

<!-- 使用数组 -->
<keep-alive :include="['ComponentA', 'ComponentB']">
  <component :is="currentView" />
</keep-alive>

<!-- 使用正则 -->
<keep-alive :include="/^Component[AB]$/">
  <component :is="currentView" />
</keep-alive>
```

**注意**:匹配的是**组件的 name 选项**,不是组件文件名!

```js
// ComponentA.vue
export default {
  name: 'ComponentA', // 必须设置 name
}
```

### 4.2 exclude:缓存黑名单

```vue
<!-- 除了 ComponentC,其他都缓存 -->
<keep-alive exclude="ComponentC">
  <component :is="currentView" />
</keep-alive>
```

**优先级**:exclude 优先级 > include

### 4.3 max:最大缓存数

```vue
<!-- 最多缓存 5 个组件 -->
<keep-alive :max="5">
  <component :is="currentView" />
</keep-alive>
```

**超过限制时**:使用 LRU 策略,删除最久未使用的组件。

---

## 5. 与 Vue Router 配合

### 5.1 缓存所有路由组件

```vue
<template>
  <keep-alive>
    <router-view />
  </keep-alive>
</template>
```

### 5.2 根据路由 meta 动态缓存

**路由配置**:

```js
const routes = [
  {
    path: '/list',
    component: List,
    meta: { keepAlive: true }, // 需要缓存
  },
  {
    path: '/detail/:id',
    component: Detail,
    meta: { keepAlive: false }, // 不缓存
  },
]
```

**组件中使用**:

```vue
<template>
  <keep-alive>
    <router-view v-if="$route.meta.keepAlive" />
  </keep-alive>
  <router-view v-if="!$route.meta.keepAlive" />
</template>
```

### 5.3 根据路由 name 缓存

```vue
<template>
  <keep-alive :include="cachedViews">
    <router-view />
  </keep-alive>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 动态计算需要缓存的组件
const cachedViews = computed(() => {
  // 从 Vuex/Pinia 或其他状态管理中获取
  return ['List', 'Profile']
})
</script>
```

### 5.4 列表页缓存,详情页不缓存

```js
// router/index.js
const routes = [
  {
    path: '/list',
    name: 'List',
    component: List,
    meta: { keepAlive: true },
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: Detail,
    meta: { keepAlive: false },
  },
]
```

```vue
<!-- App.vue -->
<template>
  <keep-alive>
    <router-view v-if="$route.meta.keepAlive" :key="$route.fullPath" />
  </keep-alive>
  <router-view v-if="!$route.meta.keepAlive" :key="$route.fullPath" />
</template>
```

---

## 6. 常见场景与最佳实践

### 6.1 场景 1:列表页滚动位置保存

```vue
<script setup>
import { ref, onActivated, onDeactivated } from 'vue'

const scrollTop = ref(0)

onActivated(() => {
  // 恢复滚动位置
  window.scrollTo(0, scrollTop.value)
})

onDeactivated(() => {
  // 保存滚动位置
  scrollTop.value = window.scrollY
})
</script>
```

### 6.2 场景 2:表单数据保留

```vue
<script setup>
const formData = ref({
  name: '',
  email: '',
})

onActivated(() => {
  console.log('表单数据已保留:', formData.value)
  // 可以在此刷新其他数据,但表单数据不会丢失
})
</script>
```

### 6.3 场景 3:定时器管理

```vue
<script setup>
let timer = null

onActivated(() => {
  // 恢复定时器
  timer = setInterval(() => {
    fetchData()
  }, 5000)
})

onDeactivated(() => {
  // 清除定时器,避免后台一直运行
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

onBeforeUnmount(() => {
  // 组件真正销毁时也要清除
  if (timer) {
    clearInterval(timer)
  }
})
</script>
```

### 6.4 场景 4:条件刷新数据

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

onActivated(() => {
  // 从详情页返回列表页时,刷新数据
  if (route.params.refresh) {
    fetchList()
  }
})
</script>
```

---

## 7. 性能优化建议

### 7.1 控制缓存数量

```vue
<!-- ❌ 不推荐:无限缓存 -->
<keep-alive>
  <router-view />
</keep-alive>

<!-- ✅ 推荐:限制最大缓存数 -->
<keep-alive :max="10">
  <router-view />
</keep-alive>
```

**原因**:缓存太多会占用大量内存,导致页面卡顿。

### 7.2 精确指定缓存组件

```vue
<!-- ❌ 不推荐:缓存所有组件 -->
<keep-alive>
  <router-view />
</keep-alive>

<!-- ✅ 推荐:只缓存需要的组件 -->
<keep-alive :include="['List', 'Profile']">
  <router-view />
</keep-alive>
```

### 7.3 大组件不要缓存

如果组件很重(大量 DOM、复杂计算):

- ❌ 不适合缓存(占内存)
- ✅ 使用局部状态管理(Vuex/Pinia)保存关键数据

---

## 8. 常见陷阱

### 陷阱 1:组件没有 name,缓存失效

```vue
<!-- ComponentA.vue -->
<script setup>
// ❌ 没有 name,include 无法匹配
</script>

<!-- ✅ 正确:设置 name -->
<script>
export default {
  name: 'ComponentA',
}
</script>
<script setup>
// 组件逻辑
</script>
```

**Vue 3.3+ 的简化写法**:

```vue
<script setup>
defineOptions({
  name: 'ComponentA',
})
</script>
```

### 陷阱 2:使用 v-if 导致缓存失效

```vue
<!-- ❌ v-if 会销毁组件,缓存失效 -->
<keep-alive>
  <ComponentA v-if="show" />
</keep-alive>

<!-- ✅ 使用 v-show 或 动态组件 -->
<keep-alive>
  <component :is="show ? 'ComponentA' : null" />
</keep-alive>
```

### 陷阱 3:activated 中的异步操作未取消

```vue
<script setup>
let controller = null

onActivated(async () => {
  controller = new AbortController()

  try {
    const data = await fetch('/api/data', {
      signal: controller.signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求已取消')
    }
  }
})

onDeactivated(() => {
  // 取消未完成的请求
  if (controller) {
    controller.abort()
  }
})
</script>
```

### 陷阱 4:路由参数变化,组件未更新

```vue
<template>
  <keep-alive>
    <!-- ❌ 路由从 /user/1 → /user/2,组件不会重新渲染 -->
    <router-view />
  </keep-alive>
</template>

<!-- ✅ 解决方案 1:添加 key -->
<template>
  <keep-alive>
    <router-view :key="$route.fullPath" />
  </keep-alive>
</template>

<!-- ✅ 解决方案 2:在 activated 中监听参数 -->
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onActivated(() => {
  watch(
    () => route.params.id,
    (newId) => {
      fetchUserData(newId)
    },
    { immediate: true }
  )
})
</script>
```

---

## 9. 手写简化版 keep-alive

```js
import { h, getCurrentInstance, onMounted, onUpdated } from 'vue'

export const KeepAlive = {
  name: 'KeepAlive',
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number],
  },
  setup(props, { slots }) {
    const cache = new Map()
    const keys = new Set()

    const instance = getCurrentInstance()

    // 渲染函数
    return () => {
      const vnode = slots.default?.()[0]
      if (!vnode) return null

      const name = vnode.type.name

      // 检查 include/exclude
      if (props.include && !matches(name, props.include)) {
        return vnode
      }
      if (props.exclude && matches(name, props.exclude)) {
        return vnode
      }

      // 缓存逻辑
      const key = vnode.key ?? vnode.type
      const cachedVNode = cache.get(key)

      if (cachedVNode) {
        // 复用缓存的组件实例
        vnode.component = cachedVNode.component
        // 更新 keys 顺序(LRU)
        keys.delete(key)
        keys.add(key)
      } else {
        // 新组件,加入缓存
        cache.set(key, vnode)
        keys.add(key)

        // 超过 max,删除最久未使用的
        if (props.max && keys.size > parseInt(props.max)) {
          const oldestKey = keys.values().next().value
          cache.delete(oldestKey)
          keys.delete(oldestKey)
        }
      }

      // 标记为 keep-alive 组件
      vnode.shapeFlag |= 512 // COMPONENT_KEPT_ALIVE

      return vnode
    }
  },
}

function matches(name, pattern) {
  if (Array.isArray(pattern)) {
    return pattern.includes(name)
  }
  if (typeof pattern === 'string') {
    return pattern.split(',').includes(name)
  }
  if (pattern instanceof RegExp) {
    return pattern.test(name)
  }
  return false
}
```

---

## 10. 面试高频问题

### Q1:keep-alive 的原理是什么?

1. **缓存机制**:将组件实例缓存在内存中,而不是销毁
2. **LRU 策略**:最大缓存数达到时,删除最久未使用的组件
3. **生命周期**:不触发 unmount,而是触发 activated/deactivated

### Q2:activated 和 mounted 的区别?

| 钩子      | 触发时机               | 触发次数     |
| --------- | ---------------------- | ------------ |
| mounted   | 组件首次挂载后         | 只触发一次   |
| activated | 每次从缓存恢复时       | 多次触发     |

### Q3:如何清除 keep-alive 的缓存?

**方法 1:动态修改 include**

```js
const cachedViews = ref(['ComponentA', 'ComponentB'])

// 移除 ComponentA 的缓存
cachedViews.value = cachedViews.value.filter((name) => name !== 'ComponentA')
```

**方法 2:使用 key 强制重新渲染**

```vue
<keep-alive>
  <component :is="currentView" :key="forceReloadKey" />
</keep-alive>

<script setup>
const forceReloadKey = ref(0)

const reload = () => {
  forceReloadKey.value++
}
</script>
```

### Q4:keep-alive 会影响性能吗?

**优点**:

- ✅ 避免重复渲染,切换更快
- ✅ 保留用户状态,体验更好

**缺点**:

- ❌ 缓存占用内存
- ❌ 缓存过多会导致内存溢出

**建议**:

- 设置 `max` 限制缓存数
- 只缓存必要的组件
- 大组件不要缓存

---

## 11. 总结

**keep-alive 的核心**:

1. **缓存策略**:LRU(最近最少使用)
2. **生命周期**:activated / deactivated
3. **配置选项**:include / exclude / max
4. **使用场景**:列表页、表单页、tab 切换

**面试答题框架**:

1. **是什么**:缓存组件实例,避免重复渲染
2. **为什么**:保留状态、提升性能、改善体验
3. **怎么用**:配置 include/exclude/max,监听 activated
4. **注意**:控制缓存数量、组件必须有 name、清理定时器

记住:**keep-alive 是性能优化的利器,但要合理使用,避免内存泄漏**。
