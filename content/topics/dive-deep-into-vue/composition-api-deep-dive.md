---
title: 'Composition API：逻辑复用的新范式'
description: '深入理解 Composition API 的设计动机、ref vs reactive 的选择、组合式函数(Composables)的最佳实践,以及与 Options API 的对比'
date: 2025-01-30
order: 10
---

> Composition API 是 Vue 3 最重要的特性,但很多人用不好:
>
> - 什么时候用 ref?什么时候用 reactive?
> - 为什么要用 Composition API?Options API 不好吗?
> - 如何写出优雅的组合式函数(Composables)?
>
> 这一篇我们把**设计动机、核心 API、最佳实践**讲透。

---

## 1. 为什么需要 Composition API?

### 1.1 Options API 的三大问题

#### 问题 1:逻辑分散(同一功能的代码分散在多个选项中)

```js
export default {
  data() {
    return {
      // 搜索相关
      searchText: '',
      searchResults: [],
      // 排序相关
      sortOrder: 'asc',
    }
  },
  computed: {
    // 搜索相关
    filteredResults() {
      return this.searchResults.filter(/*...*/)
    },
  },
  methods: {
    // 搜索相关
    handleSearch() {
      /*...*/
    },
    // 排序相关
    handleSort() {
      /*...*/
    },
  },
  mounted() {
    // 搜索相关
    this.fetchResults()
  },
}
```

**搜索功能的代码**分散在 data、computed、methods、mounted 中,维护困难。

#### 问题 2:逻辑复用困难

Options API 的复用方案都有缺陷:

- **Mixins**:命名冲突、来源不清
- **高阶组件**:嵌套地狱
- **Renderless Components**:额外的组件实例开销

#### 问题 3:类型推导困难

```js
export default {
  data() {
    return {
      count: 0,
    }
  },
  methods: {
    increment() {
      this.count++ // TypeScript 很难推导 this
    },
  },
}
```

### 1.2 Composition API 的解决方案

**相同的逻辑组织在一起**:

```js
// 搜索功能
function useSearch() {
  const searchText = ref('')
  const searchResults = ref([])

  const filteredResults = computed(() => {
    return searchResults.value.filter(/*...*/)
  })

  const handleSearch = () => {
    /*...*/
  }

  onMounted(() => {
    fetchResults()
  })

  return { searchText, searchResults, filteredResults, handleSearch }
}

// 组件中使用
export default {
  setup() {
    const { searchText, handleSearch } = useSearch()
    const { sortOrder, handleSort } = useSort()

    return { searchText, handleSearch, sortOrder, handleSort }
  },
}
```

**优势**:

- ✅ 逻辑内聚
- ✅ 易于复用
- ✅ 类型推导友好

---

## 2. ref vs reactive:深度对比

### 2.1 核心差异

| 特性       | ref                 | reactive         |
| ---------- | ------------------- | ---------------- |
| 适用类型   | 任何类型            | 只能是对象/数组  |
| 访问方式   | 需要 .value         | 直接访问         |
| 响应式实现 | 对象包装 + getter   | Proxy 代理       |
| 解构       | 可以解构(用 toRefs) | 解构后丢失响应式 |
| 重新赋值   | 可以                | 不可以           |

### 2.2 使用示例

```js
// ref:基本类型
const count = ref(0)
count.value++ // 必须 .value

// ref:对象
const user = ref({ name: 'Ada' })
user.value = { name: 'Bob' } // ✅ 可以整体替换
user.value.name = 'Charlie' // ✅ 也可以修改属性

// reactive:对象
const state = reactive({ count: 0 })
state.count++ // 直接访问

// ❌ 不能整体替换
state = { count: 1 } // 错误!响应式丢失
```

### 2.3 解构的问题

```js
const state = reactive({ count: 0, name: 'Ada' })

// ❌ 解构后丢失响应式
const { count } = state
count++ // 不会触发更新

// ✅ 使用 toRefs
const { count, name } = toRefs(state)
count.value++ // 触发更新
```

**原理**:toRefs 把每个属性转成 ref。

```js
function toRefs(obj) {
  const ret = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }
  return ret
}
```

### 2.4 选择建议

```text
基本类型(数字/字符串/布尔)?
  → ref

需要整体替换对象?
  → ref

需要解构返回值?
  → ref + toRefs

复杂嵌套对象,不需要替换?
  → reactive

组合式函数返回值?
  → ref (便于解构)
```

---

## 3. 组合式函数(Composables)最佳实践

### 3.1 命名约定

```js
// ✅ 推荐:use 开头
function useMouse() {
  /*...*/
}
function useLocalStorage() {
  /*...*/
}

// ❌ 不推荐
function mouse() {
  /*...*/
}
```

### 3.2 返回值约定

```js
// ✅ 推荐:返回 ref,便于解构
function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const increment = () => count.value++

  return { count, increment } // 返回对象,可解构
}

// ❌ 不推荐:返回 reactive,解构后丢失响应式
function useCounter() {
  return reactive({ count: 0, increment: () => {} })
}
```

### 3.3 完整示例:useLocalStorage

```js
import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  // 从 localStorage 读取初始值
  const storedValue = localStorage.getItem(key)
  const data = ref(storedValue ? JSON.parse(storedValue) : initialValue)

  // 监听变化,同步到 localStorage
  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true },
  )

  return data
}

// 使用
const theme = useLocalStorage('theme', 'dark')
theme.value = 'light' // 自动保存到 localStorage
```

### 3.4 处理副作用:自动清理

```js
export function useEventListener(target, event, handler) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })

  onBeforeUnmount(() => {
    target.removeEventListener(event, handler)
  })
}

// 使用
useEventListener(window, 'resize', () => {
  console.log('窗口大小改变')
})
// 组件卸载时自动移除监听器
```

---

## 4. setup() 的执行时机和特性

### 4.1 执行时机

```js
export default {
  setup(props, context) {
    console.log('setup 执行')
    // 在 beforeCreate 之前执行
    // 此时 this 还未创建
  },
  beforeCreate() {
    console.log('beforeCreate')
  },
}
```

### 4.2 参数

```js
setup(props, context) {
  // props:响应式的 props
  console.log(props.title)

  // context:非响应式的上下文
  const { attrs, slots, emit, expose } = context

  // 触发事件
  emit('update', 'new value')

  // 暴露给父组件
  expose({
    someMethod() {}
  })

  return { /* 返回给模板使用 */ }
}
```

### 4.3 script setup 语法糖

```vue
<!-- 传统 setup -->
<script>
export default {
  setup() {
    const count = ref(0)
    return { count }
  },
}
</script>

<!-- script setup -->
<script setup>
const count = ref(0)
// 自动返回给模板,不需要 return
</script>
```

**优势**:

- ✅ 更少的样板代码
- ✅ 更好的类型推导
- ✅ 编译时优化

---

## 5. 常见模式和技巧

### 5.1 条件式组合

```js
function useFeature(enabled) {
  if (enabled) {
    const data = ref(null)

    onMounted(() => {
      fetchData()
    })

    return { data }
  }

  return { data: ref(null) }
}
```

### 5.2 组合多个 Composables

```js
function useUserProfile() {
  const { user } = useAuth()
  const { data: profile } = useFetch(`/api/users/${user.id}`)
  const { save } = useLocalStorage('profile', profile)

  return { user, profile, save }
}
```

### 5.3 异步 setup(实验性)

```vue
<script setup>
// ✅ 顶层 await
const data = await fetchData()
// 组件会等待异步操作完成后再渲染
</script>
```

**注意**:需要配合 `<Suspense>` 使用。

---

## 6. Composition API vs Options API

### 6.1 何时用 Composition API?

**适合**:

- ✅ 大型组件,逻辑复杂
- ✅ 需要复用逻辑
- ✅ 需要更好的 TypeScript 支持

**不适合**:

- ❌ 简单组件(几十行代码)
- ❌ 团队不熟悉

### 6.2 可以混用吗?

可以,但不推荐:

```vue
<script>
export default {
  data() {
    return { count: 0 }
  },
  setup() {
    const name = ref('Ada')
    return { name }
  },
}
</script>
```

**问题**:逻辑分散,失去了 Composition API 的优势。

---

## 7. 面试高频问题

### Q1:Composition API 的优势是什么?

1. **逻辑组织**:相关代码组织在一起
2. **逻辑复用**:通过组合式函数复用
3. **类型推导**:更好的 TypeScript 支持
4. **Tree-shaking**:未使用的代码可被移除

### Q2:ref 和 reactive 怎么选?

| 场景             | 推荐     |
| ---------------- | -------- |
| 基本类型         | ref      |
| 需要整体替换     | ref      |
| 复杂嵌套对象     | reactive |
| 组合式函数返回值 | ref      |

### Q3:为什么 reactive 解构会丢失响应式?

因为解构是**取值**,不是引用:

```js
const state = reactive({ count: 0 })
const { count } = state // count 是数字 0,不是响应式
```

**解决**:用 `toRefs`:

```js
const { count } = toRefs(state) // count 是 ref
```

### Q4:setup() 中如何访问 this?

**不能!** setup() 执行时 this 还未创建。

```js
import { getCurrentInstance } from 'vue'

setup() {
  const instance = getCurrentInstance()
  console.log(instance.proxy) // 等同于 this
}
```

---

## 8. 总结

**Composition API 的核心**:

1. **逻辑内聚**:相关代码组织在一起
2. **逻辑复用**:通过组合式函数
3. **类型安全**:更好的 TypeScript 支持

**面试答题框架**:

1. **为什么**:Options API 逻辑分散、复用困难
2. **是什么**:基于函数的 API,逻辑组织更灵活
3. **怎么用**:ref/reactive + 组合式函数
4. **注意**:ref 需要 .value,reactive 解构丢失响应式

记住:**Composition API 不是替代,而是补充。选择合适的工具做合适的事**。
