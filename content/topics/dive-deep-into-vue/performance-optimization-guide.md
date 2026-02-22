---
title: '性能优化：从编译到运行时的最佳实践'
description: '深入理解 Vue 的编译优化(静态提升、patchFlag)、运行时优化(v-once、v-memo)、以及虚拟滚动、懒加载等工程化实践'
date: 2025-01-30
order: 12
---

> 性能优化是面试的加分项,也是实际项目的必备技能:
>
> - 首屏加载慢怎么优化?
> - 列表渲染卡顿怎么解决?
> - Vue 3 的编译优化有哪些?
> - 什么时候用 v-once、v-memo?
>
> 这一篇我们把 **编译优化、运行时优化、工程化实践** 讲透。

---

## 1. Vue 3 的编译优化

### 1.1 静态提升(Static Hoisting)

**Vue 2 的问题**:每次渲染都重新创建静态节点。

```js
// Vue 2 编译结果
function render() {
  return h('div', [
    h('span', '静态文本'), // 每次渲染都创建
    h('span', this.dynamic),
  ])
}
```

**Vue 3 的优化**:静态节点提升到渲染函数外部,只创建一次。

```js
// Vue 3 编译结果
const _hoisted_1 = h('span', '静态文本') // 提升,只创建一次

function render() {
  return h('div', [
    _hoisted_1, // 复用
    h('span', this.dynamic),
  ])
}
```

**效果**:

- ✅ 减少内存分配
- ✅ 减少 GC 压力
- ✅ 提升渲染性能

### 1.2 patchFlag(动态标记)

**问题**:Vue 2 无法区分哪些属性是动态的,需要全量对比。

**Vue 3 的解决方案**:给每个动态节点打标记,只比较动态部分。

```vue
<template>
  <div class="container">
    <span>静态文本</span>
    <span>{{ message }}</span>
    <span :class="className">动态 class</span>
  </div>
</template>
```

**编译结果**:

```js
function render() {
  return h('div', { class: 'container' }, [
    _hoisted_1, // 静态节点,完全跳过
    h('span', null, _toDisplayString(message), 1 /* TEXT */),
    h('span', { class: className }, '动态 class', 2 /* CLASS */),
  ])
}
```

**patchFlag 类型**:

| Flag | 含义           | 优化效果         |
| ---- | -------------- | ---------------- |
| 1    | TEXT           | 只比较文本内容   |
| 2    | CLASS          | 只比较 class     |
| 4    | STYLE          | 只比较 style     |
| 8    | PROPS          | 只比较动态 props |
| 16   | FULL_PROPS     | 比较所有 props   |
| 32   | HYDRATE_EVENTS | 只比较事件监听器 |

### 1.3 Block Tree(块级作用域树)

**原理**:收集所有动态节点,Diff 时只遍历这些节点。

```vue
<template>
  <div>
    <span>静态 1</span>
    <span>{{ dynamic1 }}</span>
    <div>
      <span>静态 2</span>
      <span>{{ dynamic2 }}</span>
    </div>
  </div>
</template>
```

**Block 收集的动态节点**:

```js
dynamicChildren = [
  // 跳过所有静态节点
  { tag: 'span', children: dynamic1, patchFlag: 1 },
  { tag: 'span', children: dynamic2, patchFlag: 1 },
]
```

**效果**:Diff 时间从 O(n) 降到 O(动态节点数)。

### 1.4 事件缓存

**Vue 2**:每次渲染都创建新的事件处理函数。

```js
// 每次都是新函数,导致子组件重新渲染
h('button', { onClick: () => this.count++ })
```

**Vue 3**:缓存事件处理函数。

```js
// 首次创建
const _cache = []
_cache[0] = () => this.count++

// 后续复用
h('button', { onClick: _cache[0] })
```

---

## 2. 运行时优化 API

### 2.1 v-once:只渲染一次

```vue
<template>
  <!-- 只渲染一次,后续更新跳过 -->
  <div v-once>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>
```

**适用场景**:

- ✅ 静态内容(不会变化)
- ✅ 初始化后就固定的数据

**注意**:整个子树都不会更新,包括子组件!

### 2.2 v-memo:条件缓存(Vue 3.2+)

**类似 React.memo**,但更灵活。

```vue
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    <span>{{ item.name }}</span>
    <span>{{ item.selected ? '已选' : '未选' }}</span>
  </div>
</template>
```

**工作原理**:

- 只有 `item.id` 或 `item.selected` 变化时,才重新渲染
- 其他属性变化(如 `item.name`)不会触发渲染

**适用场景**:

- ✅ 大列表优化
- ✅ 复杂计算的缓存

**性能对比**:

```js
// 1000 项列表,只改变一项
// 无 v-memo:渲染 1000 次
// 有 v-memo:渲染 1 次
```

### 2.3 v-show vs v-if 选择

```vue
<!-- 频繁切换:v-show -->
<Modal v-show="isOpen" />

<!-- 很少改变:v-if -->
<AdminPanel v-if="isAdmin" />
```

---

## 3. 列表优化

### 3.1 key 的重要性

```vue
<!-- ❌ 不要用 index 做 key -->
<div v-for="(item, index) in list" :key="index">{{ item.name }}</div>

<!-- ✅ 用唯一 ID -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

### 3.2 虚拟滚动(Virtual Scroll)

**问题**:渲染 10000 条数据,DOM 节点太多,卡顿。

**解决方案**:只渲染可见区域的数据。

```vue
<template>
  <div class="virtual-list" @scroll="handleScroll" ref="containerRef">
    <div :style="{ height: totalHeight + 'px' }">
      <div
        v-for="item in visibleData"
        :key="item.id"
        :style="{ transform: `translateY(${startOffset}px)` }"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['data', 'itemHeight'])

const containerRef = ref(null)
const scrollTop = ref(0)

// 可见区域的起始索引
const startIndex = computed(() =>
  Math.floor(scrollTop.value / props.itemHeight),
)

// 可见区域的结束索引
const endIndex = computed(() => {
  const count =
    Math.ceil(containerRef.value?.clientHeight / props.itemHeight) + 1
  return startIndex.value + count
})

// 可见数据
const visibleData = computed(() => {
  return props.data.slice(startIndex.value, endIndex.value)
})

// 总高度
const totalHeight = computed(() => props.data.length * props.itemHeight)

// 偏移量
const startOffset = computed(() => startIndex.value * props.itemHeight)

const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}
</script>
```

**推荐库**:

- [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)
- [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)

### 3.3 列表懒加载(Infinite Scroll)

```vue
<script setup>
import { ref, onMounted } from 'vue'

const list = ref([])
const page = ref(1)
const loading = ref(false)

const loadMore = async () => {
  if (loading.value) return

  loading.value = true
  const newData = await api.getList(page.value)
  list.value.push(...newData)
  page.value++
  loading.value = false
}

const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target

  // 距离底部 100px 时加载
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore()
  }
}

onMounted(() => {
  loadMore()
})
</script>
```

**推荐库**:

- [vueuse - useInfiniteScroll](https://vueuse.org/core/useInfiniteScroll/)

---

## 4. 组件优化

### 4.1 异步组件

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => import('./HeavyComponent.vue'))

// 带加载状态
const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200, // 200ms 后显示 loading
  timeout: 3000, // 3s 超时
})
```

### 4.2 函数式组件(性能更好)

**Vue 3 中,所有组件都是函数式的**,无需特殊声明。

### 4.3 避免不必要的响应式

```js
// ❌ 大数据不需要响应式
const bigData = reactive(hugeArray)

// ✅ 使用 markRaw / shallowRef
import { markRaw, shallowRef } from 'vue'

const bigData = markRaw(hugeArray) // 永久禁用响应式
const chartInstance = shallowRef(null) // 只追踪 .value 的引用变化
```

---

## 5. 图片优化

### 5.1 懒加载

```vue
<template>
  <img v-lazy="imageSrc" alt="懒加载图片" />
</template>

<script setup>
import { directive as vLazy } from 'vue3-lazy'

// 或手动实现
const lazyLoad = {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        el.src = binding.value
        observer.unobserve(el)
      }
    })
    observer.observe(el)
  },
}
</script>
```

### 5.2 响应式图片

```vue
<picture>
  <source srcset="image-small.webp" media="(max-width: 600px)" />
  <source srcset="image-large.webp" media="(min-width: 601px)" />
  <img src="image-fallback.jpg" alt="响应式图片" />
</picture>
```

---

## 6. 打包优化

### 6.1 路由懒加载

```js
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue'),
  },
]
```

### 6.2 组件库按需引入

```js
// ❌ 全量引入
import ElementPlus from 'element-plus'
app.use(ElementPlus)

// ✅ 按需引入
import { ElButton, ElInput } from 'element-plus'
app.use(ElButton).use(ElInput)

// ✅ 自动按需引入(推荐)
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default {
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
}
```

### 6.3 Tree Shaking

```js
// ✅ 使用 ES Module
import { debounce } from 'lodash-es'

// ❌ 避免 CommonJS
import _ from 'lodash'
```

### 6.4 CDN 加速

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>

<!-- vite.config.js -->
export default { build: { rollupOptions: { external: ['vue'], output: { globals:
{ vue: 'Vue', }, }, }, }, }
```

---

## 7. 网络优化

### 7.1 请求合并与缓存

```js
// 使用 DataLoader 模式
class UserLoader {
  constructor() {
    this.cache = new Map()
    this.queue = []
    this.timer = null
  }

  load(id) {
    if (this.cache.has(id)) {
      return Promise.resolve(this.cache.get(id))
    }

    return new Promise((resolve) => {
      this.queue.push({ id, resolve })

      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.flush()
        }, 10) // 10ms 内的请求合并
      }
    })
  }

  async flush() {
    const ids = this.queue.map((item) => item.id)
    const users = await api.getUsersByIds(ids)

    this.queue.forEach((item, index) => {
      this.cache.set(item.id, users[index])
      item.resolve(users[index])
    })

    this.queue = []
    this.timer = null
  }
}
```

### 7.2 防抖与节流

```js
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

// 防抖:搜索输入
const debouncedSearch = useDebounceFn((keyword) => {
  api.search(keyword)
}, 300)

// 节流:滚动事件
const throttledScroll = useThrottleFn(() => {
  console.log('scroll')
}, 100)
```

---

## 8. 性能监控

### 8.1 Performance API

```js
// 测量组件渲染时间
import { onMounted } from 'vue'

onMounted(() => {
  performance.mark('component-mounted')
  performance.measure('render-time', 'navigationStart', 'component-mounted')

  const measure = performance.getEntriesByName('render-time')[0]
  console.log('渲染时间:', measure.duration, 'ms')
})
```

### 8.2 Vue DevTools

- Timeline:查看组件渲染、事件触发
- Performance:分析性能瓶颈
- Component Inspector:查看组件状态

### 8.3 Lighthouse

- 首屏性能(FCP、LCP)
- 交互性(FID、TBT)
- 视觉稳定性(CLS)

---

## 9. 面试高频问题

### Q1:Vue 3 有哪些编译优化?

1. **静态提升**:静态节点只创建一次
2. **patchFlag**:标记动态内容类型,精准 Diff
3. **Block Tree**:收集动态节点,跳过静态节点
4. **事件缓存**:避免每次重新创建函数

### Q2:如何优化大列表渲染?

1. **虚拟滚动**:只渲染可见区域
2. **v-memo**:缓存不变的列表项
3. **懒加载**:分批加载数据
4. **合理使用 key**:确保节点复用

### Q3:v-once 和 v-memo 的区别?

| 指令   | 作用                  | 适用场景   |
| ------ | --------------------- | ---------- |
| v-once | 只渲染一次,永不更新   | 纯静态内容 |
| v-memo | 条件缓存,依赖变化更新 | 大列表优化 |

### Q4:首屏加载慢如何优化?

1. **路由懒加载**:按需加载组件
2. **代码分割**:拆分 chunk
3. **CDN 加速**:外部依赖走 CDN
4. **图片优化**:懒加载、压缩、webp
5. **SSR/SSG**:服务端渲染
6. **预加载**:关键资源 `<link rel="preload">`

---

## 10. 性能优化 Checklist

### 编译时

- ✅ 使用 Vue 3(编译优化更强)
- ✅ 合理使用 v-once、v-memo
- ✅ 避免在模板中写复杂表达式

### 运行时

- ✅ 大列表使用虚拟滚动
- ✅ 图片懒加载
- ✅ 合理使用 v-show/v-if
- ✅ 避免不必要的响应式(markRaw/shallowRef)

### 打包时

- ✅ 路由懒加载
- ✅ 组件库按需引入
- ✅ Tree Shaking(ES Module)
- ✅ 代码分割

### 网络层

- ✅ CDN 加速
- ✅ Gzip 压缩
- ✅ 请求合并与缓存
- ✅ 防抖/节流

---

## 11. 总结

**性能优化的核心原则**:

1. **减少渲染**:v-once、v-memo、虚拟滚动
2. **减少计算**:computed 缓存、避免深层响应式
3. **减少体积**:懒加载、Tree Shaking、CDN
4. **减少请求**:合并、缓存、防抖节流

**面试答题框架**:

1. **编译优化**:静态提升、patchFlag、Block Tree
2. **运行时优化**:v-once/v-memo、虚拟滚动
3. **工程化**:懒加载、按需引入、代码分割
4. **监控**:Performance API、DevTools、Lighthouse

记住:**性能优化是一个系统工程,从编译、运行到网络,每个环节都有优化空间**。
