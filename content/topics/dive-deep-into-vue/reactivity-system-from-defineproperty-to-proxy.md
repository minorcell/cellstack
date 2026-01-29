---
title: '响应式原理：从 Object.defineProperty 到 Proxy 的演进'
description: '从"为什么直接改数组不更新"这个经典坑出发,深入剖析 Vue 2/3 响应式系统的本质差异:依赖收集、派发更新、Proxy 的优势,以及响应式陷阱与最佳实践'
date: 2025-01-30
order: 1
---

> 你肯定遇到过这些"诡异"现象:
>
> - Vue 2 里 `arr[0] = newValue` 不更新,但 `arr.push()` 可以
> - 给对象新增属性不触发更新,必须用 `$set`
> - Vue 3 里这些问题突然就消失了
>
> 这背后是什么原理? 为什么 Vue 2 和 Vue 3 行为不一样?
> 这一篇我们从**响应式系统的本质**讲起,把 Vue 2 的 `Object.defineProperty` 和 Vue 3 的 `Proxy` 拆开对比,让你彻底理解"响应式"到底是什么。

---

## 0. 先给你一句总纲:响应式不是"自动更新",而是"依赖收集 + 变更通知"

很多人把响应式理解成"数据变了,视图自动跟着变",这不算错,但太表面。

更准确的模型是:

1. **依赖收集(track)**:在首次渲染/计算时,记录下"谁用了我"
2. **派发更新(trigger)**:数据变化时,通知所有依赖者重新执行
3. **调度系统**:合并多次更新,异步批量刷新(nextTick)

响应式系统的核心不是"魔法",而是:

> **让数据变化可被拦截,从而触发副作用函数(effect)的重新执行。**

---

## 1. Vue 2 的响应式:Object.defineProperty 的精巧与局限

### 1.1 核心机制:getter/setter 拦截

Vue 2 在初始化时,会递归遍历 `data` 对象,通过 `Object.defineProperty` 把每个属性转成 getter/setter:

```js
function defineReactive(obj, key, val) {
  const dep = new Dep() // 依赖收集器

  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集:记录当前正在执行的 watcher
      if (Dep.target) {
        dep.depend()
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      // 派发更新:通知所有依赖的 watcher
      dep.notify()
    },
  })
}
```

### 1.2 依赖收集的过程

当组件渲染时:

1. 渲染函数读取 `this.name`,触发 getter
2. getter 里执行 `dep.depend()`,把当前 watcher 加入依赖列表
3. 后续 `this.name = 'new'` 触发 setter,调用 `dep.notify()`
4. 通知所有 watcher 重新执行渲染函数

**心智模型**:

```text
数据属性 → Dep(依赖收集器) → [Watcher1, Watcher2, ...]
        ↓
    set 触发
        ↓
   通知所有 Watcher 更新
```

### 1.3 Vue 2 的三大局限

#### 局限 1:无法检测对象属性的新增/删除

```js
export default {
  data() {
    return {
      user: { name: 'Ada' },
    }
  },
  mounted() {
    // ❌ 不会触发更新(属性 age 没被 defineProperty 拦截)
    this.user.age = 18

    // ✅ 必须用 $set
    this.$set(this.user, 'age', 18)
  },
}
```

**原因**:`defineProperty` 只能劫持已存在的属性,新增属性无法被拦截。

#### 局限 2:无法检测数组索引赋值和 length 修改

```js
export default {
  data() {
    return {
      list: [1, 2, 3],
    }
  },
  mounted() {
    // ❌ 不会触发更新
    this.list[0] = 100
    this.list.length = 0

    // ✅ 必须用变异方法
    this.list.splice(0, 1, 100)
  },
}
```

**原因**:给数组每个索引都加 getter/setter 性能太差,Vue 2 选择只拦截 `push/pop/shift/unshift/splice/sort/reverse` 这 7 个方法。

#### 局限 3:深层对象需要递归劫持,初始化开销大

如果 data 是一个深层嵌套对象:

```js
data() {
  return {
    deeply: {
      nested: {
        object: {
          value: 1
        }
      }
    }
  }
}
```

Vue 2 会在初始化时**递归遍历**整个对象,给每个属性加 getter/setter,数据量大时会卡顿。

---

## 2. Vue 3 的响应式:Proxy 带来的质变

### 2.1 核心机制:Proxy 拦截整个对象

Vue 3 使用 `Proxy` 代理整个对象,不再逐个属性转换:

```js
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      // 依赖收集
      track(target, key)
      return res
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      // 派发更新
      if (oldValue !== value) {
        trigger(target, key)
      }
      return result
    },
  })
}
```

### 2.2 Proxy 的核心优势

#### 优势 1:可以拦截对象属性的新增/删除

```js
import { reactive } from 'vue'

const user = reactive({ name: 'Ada' })

// ✅ 新增属性也会触发更新
user.age = 18
```

**原因**:Proxy 拦截的是对象操作本身,不管属性存不存在。

#### 优势 2:可以拦截数组索引操作

```js
const list = reactive([1, 2, 3])

// ✅ 索引赋值会触发更新
list[0] = 100

// ✅ 修改 length 也会触发更新
list.length = 0
```

#### 优势 3:懒代理(lazy reactive),按需递归

Vue 3 不会在初始化时递归整个对象,而是:

- 读取到深层对象时,才对其进行代理
- 大幅提升初始化性能

```js
const state = reactive({
  deeply: {
    nested: {
      value: 1,
    },
  },
})

// 只有访问 state.deeply 时,才会代理 nested 对象
console.log(state.deeply.nested.value)
```

### 2.3 Proxy 无法解决的问题

虽然 Proxy 强大,但也有局限:

1. **不支持 IE 11**(无法 polyfill)
2. **代理的是对象引用**,如果直接替换整个对象,响应式会丢失:

```js
let state = reactive({ count: 0 })

// ❌ 响应式丢失(state 被重新赋值为新对象)
state = { count: 1 }

// ✅ 正确做法:修改属性
state.count = 1
```

---

## 3. ref vs reactive:什么时候用哪个?

Vue 3 提供了两种响应式 API,很多人会困惑。

### 3.1 ref:包装基本类型

```js
import { ref } from 'vue'

const count = ref(0)

// 读取/修改需要 .value
console.log(count.value)
count.value++
```

**本质**:`ref` 返回一个 `{ value: xxx }` 对象,通过 getter/setter 拦截 `.value`。

### 3.2 reactive:代理对象

```js
import { reactive } from 'vue'

const state = reactive({ count: 0 })

// 直接访问属性
console.log(state.count)
state.count++
```

### 3.3 选择准则

| 场景                | 推荐用法   | 原因                              |
| ------------------- | ---------- | --------------------------------- |
| 基本类型(数字/字符) | `ref`      | reactive 只能代理对象             |
| 对象/数组           | `reactive` | 更符合直觉,不需要 `.value`        |
| 组合式函数返回值    | `ref`      | 解构后不丢失响应式                |
| 需要整体替换        | `ref`      | `count.value = newObj` 保持响应式 |
| 复杂嵌套对象        | `reactive` | 更清晰                            |

**面试高频考点**:为什么 `reactive` 对象解构后会丢失响应式?

```js
const state = reactive({ count: 0 })

// ❌ 丢失响应式
const { count } = state

// ✅ 使用 toRefs 保持响应式
const { count } = toRefs(state)
```

**原因**:解构是取出值,不是引用,`count` 变成了普通数字。`toRefs` 会把对象的每个属性转成 ref。

---

## 4. 依赖收集的底层实现:effect 与 track/trigger

### 4.1 effect:响应式的核心引擎

Vue 3 的响应式系统基于一个核心 API:`effect`(对用户不可见,内部使用)。

```js
import { reactive, effect } from '@vue/reactivity'

const state = reactive({ count: 0 })

// effect 会立即执行一次,并收集依赖
effect(() => {
  console.log('count is:', state.count)
})

// 修改 state.count,effect 会重新执行
state.count++ // 输出: count is: 1
```

### 4.2 track/trigger 的调用链

```js
// 简化版实现
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect) // 收集当前正在执行的 effect
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach((effect) => effect()) // 执行所有依赖的 effect
  }
}
```

**数据结构**:

```text
WeakMap {
  target对象 → Map {
    key属性 → Set [effect1, effect2, ...]
  }
}
```

**为什么用 WeakMap?**

- 当 target 对象不再被引用时,会被垃圾回收,避免内存泄漏
- Map 的 key 只能是对象,WeakMap 的 key 是弱引用

---

## 5. 响应式陷阱与最佳实践

### 陷阱 1:在 setup 外部修改响应式数据

```js
const state = reactive({ count: 0 })

// ❌ 在模块顶层修改,不会触发组件更新
state.count = 1

export default {
  setup() {
    // ✅ 在组件内修改才会触发更新
    const increment = () => {
      state.count++
    }

    return { state, increment }
  },
}
```

**原因**:只有在组件渲染过程中读取的数据,才会建立依赖关系。

### 陷阱 2:watch 深层对象需要 deep 选项

```js
const state = reactive({
  user: {
    name: 'Ada',
  },
})

// ❌ 不会触发 watch
watch(
  () => state.user,
  () => {
    console.log('user changed')
  },
)

// ✅ 需要 deep 选项
watch(
  () => state.user,
  () => {
    console.log('user changed')
  },
  { deep: true },
)

// ✅ 或者直接 watch 属性
watch(
  () => state.user.name,
  () => {
    console.log('name changed')
  },
)
```

### 陷阱 3:在异步回调中丢失响应式

```js
const state = reactive({ count: 0 })

setTimeout(() => {
  // ✅ 依然有效,只要 state 引用还在
  state.count++
}, 1000)

// ❌ 但如果解构了,就丢失了
const { count } = state
setTimeout(() => {
  count++ // 不会触发更新
}, 1000)
```

---

## 6. 面试高频问题汇总

### Q1:Vue 2 和 Vue 3 响应式的核心区别是什么?

| 维度          | Vue 2                 | Vue 3           |
| ------------- | --------------------- | --------------- |
| 实现方式      | Object.defineProperty | Proxy           |
| 属性新增/删除 | 需要 $set/$delete     | 直接操作        |
| 数组索引赋值  | 需要变异方法          | 直接操作        |
| 初始化性能    | 递归劫持,数据大时慢   | 懒代理,按需递归 |
| 浏览器兼容性  | 支持 IE 9+            | 不支持 IE       |

### Q2:为什么 Vue 2 数组的 push/pop 可以触发更新,但索引赋值不行?

Vue 2 重写了数组的 7 个变异方法:

```js
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(
  (method) => {
    arrayMethods[method] = function (...args) {
      const result = arrayProto[method].apply(this, args)
      // 手动触发更新
      dep.notify()
      return result
    }
  },
)
```

但索引赋值(`arr[0] = 1`)不是方法调用,无法被拦截。

### Q3:什么是依赖收集?什么时候收集?

- **什么是**:记录"哪些 effect/watcher 读取了这个数据"
- **什么时候**:
  1. 组件渲染时(render watcher)
  2. computed 计算时(computed watcher)
  3. watch 监听时(user watcher)
  4. 自定义 effect 执行时

### Q4:为什么 Vue 3 的 ref 需要 .value?

因为 JavaScript 的基本类型(number/string/boolean)是**按值传递**的,无法被 Proxy 代理。

ref 的本质是:

```js
function ref(value) {
  return {
    _isRef: true,
    get value() {
      track(this, 'value')
      return value
    },
    set value(newVal) {
      value = newVal
      trigger(this, 'value')
    },
  }
}
```

通过对象的 `.value` 属性来实现响应式。

---

## 7. 总结:响应式系统的心智模型

理解 Vue 响应式的关键是建立这个心智模型:

```text
1. 数据被代理(defineProperty/Proxy)
       ↓
2. 读取时收集依赖(track)
       ↓
3. 修改时派发更新(trigger)
       ↓
4. 调度系统合并更新(nextTick)
       ↓
5. 重新执行 effect(渲染/计算)
```

**面试答题框架**:

1. **是什么**:响应式是通过拦截数据读写,实现依赖收集和派发更新
2. **怎么做**:Vue 2 用 defineProperty,Vue 3 用 Proxy
3. **为什么**:Proxy 解决了对象新增/删除、数组索引等问题,性能更好
4. **注意什么**:解构丢失响应式、异步回调、深层监听等陷阱

记住:**响应式不是魔法,而是精心设计的依赖追踪系统。**
