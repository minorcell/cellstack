---
title: 'v-if vs v-show：条件渲染的性能权衡'
description: '深入对比 v-if 和 v-show 的编译结果、性能差异、使用场景,以及与 key、v-else、transition 配合使用的注意事项'
date: 2025-01-30
order: 6
---

> 这是一个看似简单,实则容易用错的问题:
>
> - 什么时候用 v-if?什么时候用 v-show?
> - 频繁切换用哪个?首次渲染用哪个?
> - v-if 为什么有时候需要配合 key?
>
> 这一篇我们把两者的**编译差异、性能对比、适用场景**讲透。

---

## 1. 本质差异:DOM 存在 vs CSS 隐藏

### 1.1 v-if:条件渲染(真正的销毁/创建)

```vue
<div v-if="isShow">Hello</div>
```

**编译后**:

```js
isShow ? h('div', 'Hello') : null
```

**特点**:

- ✅ 条件为 false 时,元素**不存在于 DOM**
- ✅ 切换时会**销毁和重建**组件实例
- ✅ 有**惰性**:初始为 false 时不渲染

### 1.2 v-show:样式切换(始终渲染)

```vue
<div v-show="isShow">Hello</div>
```

**编译后**:

```js
h('div', { style: { display: isShow ? '' : 'none' } }, 'Hello')
```

**特点**:

- ✅ 元素**始终存在于 DOM**
- ✅ 只切换 `display: none`
- ✅ **无惰性**:初始就会渲染

---

## 2. 性能对比:切换成本 vs 首次成本

### 2.1 首次渲染

| 指令   | 初始为 true | 初始为 false        |
| ------ | ----------- | ------------------- |
| v-if   | 正常渲染    | **不渲染,开销小**   |
| v-show | 正常渲染    | 渲染但隐藏,开销略大 |

**结论**:如果初始为 false,v-if 更优。

### 2.2 频繁切换

| 指令   | 切换成本                            |
| ------ | ----------------------------------- |
| v-if   | 销毁/创建 DOM + 组件实例,**开销大** |
| v-show | 只改 CSS,**开销小**                 |

**结论**:频繁切换,v-show 更优。

### 2.3 性能测试

```vue
<script setup>
import { ref } from 'vue'

const isShow = ref(true)

// 频繁切换
setInterval(() => {
  isShow.value = !isShow.value
}, 100)
</script>

<template>
  <!-- v-if: 每次切换都重新渲染,卡顿 -->
  <HeavyComponent v-if="isShow" />

  <!-- v-show: 切换流畅 -->
  <HeavyComponent v-show="isShow" />
</template>
```

---

## 3. 使用场景决策树

```text
条件在运行时很少改变?
  ✅ v-if

需要频繁切换显示/隐藏?
  ✅ v-show

初始条件为 false 且后续可能不需要?
  ✅ v-if

元素很复杂,切换时不想重新渲染?
  ✅ v-show

需要配合 v-else/v-else-if?
  ✅ v-if (v-show 不支持)

需要配合 <transition>?
  两者都支持,但逻辑不同
```

---

## 4. v-if 的高级用法

### 4.1 v-if + v-else-if + v-else

```vue
<div v-if="type === 'A'">A</div>
<div v-else-if="type === 'B'">B</div>
<div v-else>Other</div>
```

**注意**:元素必须紧挨着,中间不能有其他元素。

### 4.2 v-if 与 key 配合:强制重新渲染

```vue
<template>
  <input v-if="loginType === 'username'" key="username" placeholder="用户名" />
  <input v-else key="email" placeholder="邮箱" />
</template>
```

**为什么需要 key?**

- 默认情况下,Vue 会**复用相同标签的元素**
- 切换 loginType 时,input 会被复用,只更新 placeholder
- **用户输入的内容不会清空!**

**加 key 后**:

- Vue 认为是不同元素,销毁旧的,创建新的
- 用户输入的内容会被清空

### 4.3 v-if 的惰性加载

```vue
<script setup>
const tabs = ref(['home', 'profile', 'settings'])
const activeTab = ref('home')
</script>

<template>
  <div v-if="activeTab === 'home'">首页内容</div>
  <div v-if="activeTab === 'profile'">个人资料</div>
  <div v-if="activeTab === 'settings'">设置</div>
</template>
```

**优势**:未激活的 tab 不渲染,节省资源。

**劣势**:切换时需要重新渲染。

**替代方案**:v-show + keep-alive

```vue
<keep-alive>
  <component :is="activeComponent" />
</keep-alive>
```

---

## 5. v-show 的限制

### 5.1 不支持 `<template>`

```vue
<!-- ❌ 不生效 -->
<template v-show="isShow">
  <div>A</div>
  <div>B</div>
</template>

<!-- ✅ 必须用真实元素 -->
<div v-show="isShow">
  <div>A</div>
  <div>B</div>
</div>
```

### 5.2 不支持 v-else

```vue
<!-- ❌ 不生效 -->
<div v-show="isShow">A</div>
<div v-else>B</div>

<!-- ✅ 必须两个都用 v-show -->
<div v-show="isShow">A</div>
<div v-show="!isShow">B</div>
```

### 5.3 初始状态下也会渲染

```vue
<HeavyComponent v-show="false" />
<!-- 组件会被创建和挂载,只是 display: none -->
```

**问题**:如果组件很重,会影响首屏性能。

---

## 6. 与 transition 配合

### 6.1 v-if + transition:进入/离开动画

```vue
<transition name="fade">
  <div v-if="isShow">Hello</div>
</transition>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**流程**:

1. v-if 从 false → true:触发 `fade-enter` 动画
2. v-if 从 true → false:触发 `fade-leave` 动画,**动画结束后才销毁 DOM**

### 6.2 v-show + transition:只有显示动画

```vue
<transition name="fade">
  <div v-show="isShow">Hello</div>
</transition>
```

**问题**:v-show 只改 display,**不会触发 transition!**

**解决**:手动控制类名

```vue
<div :class="{ 'fade-in': isShow, 'fade-out': !isShow }" v-show="isShow">
  Hello
</div>
```

---

## 7. 编译优化:静态提升

### 7.1 v-if 的静态提升

```vue
<div v-if="isShow">
  <span>静态文本</span>
  <span>{{ dynamic }}</span>
</div>
```

**Vue 3 编译后**:

```js
const _hoisted_1 = /*#__PURE__*/ _createElementVNode(
  'span',
  null,
  '静态文本',
  -1,
)

function render() {
  return isShow
    ? _createElementBlock('div', null, [
        _hoisted_1, // 静态节点提升,不重新创建
        _createElementVNode('span', null, _toDisplayString(dynamic), 1),
      ])
    : _createCommentVNode('v-if', true)
}
```

**优势**:静态内容只创建一次,切换时复用。

---

## 8. 常见陷阱

### 陷阱 1:v-if 与 v-for 同时使用

```vue
<!-- ❌ Vue 2:v-for 优先级高,性能差 -->
<div v-for="item in list" v-if="item.active">{{ item.name }}</div>

<!-- ❌ Vue 3:v-if 优先级高,访问不到 item -->
<div v-for="item in list" v-if="item.active">{{ item.name }}</div>

<!-- ✅ 正确:先用 computed 过滤 -->
<script setup>
const activeList = computed(() => list.value.filter((item) => item.active))
</script>

<div v-for="item in activeList">{{ item.name }}</div>
```

### 陷阱 2:v-show 对子组件生命周期无效

```vue
<Child v-show="false" />
<!-- Child 的 mounted 仍会执行! -->
```

**解决**:需要控制子组件行为,用 v-if。

### 陷阱 3:v-if 的复用导致状态保留

```vue
<input v-if="type === 'text'" type="text" />
<input v-else type="password" />
<!-- 切换时,input 会被复用,输入内容不清空 -->

<!-- 解决:加 key -->
<input v-if="type === 'text'" type="text" key="text" />
<input v-else type="password" key="password" />
```

---

## 9. 面试高频问题

### Q1:v-if 和 v-show 的区别?

| 维度     | v-if               | v-show       |
| -------- | ------------------ | ------------ |
| 实现方式 | 条件渲染,销毁/创建 | CSS display  |
| 初始开销 | 低(false 时不渲染) | 高(总是渲染) |
| 切换开销 | 高(销毁/创建 DOM)  | 低(只改 CSS) |
| 适用场景 | 很少改变的条件     | 频繁切换     |
| 配套指令 | v-else-if/v-else   | 无           |
| 生命周期 | 触发销毁/挂载      | 不触发       |

### Q2:什么时候用 v-if?什么时候用 v-show?

**v-if**:

- 条件很少改变
- 初始为 false 且可能不需要
- 需要 v-else-if/v-else

**v-show**:

- 需要频繁切换
- 元素复杂,避免重复渲染

### Q3:为什么 v-if 有更高的切换开销?

因为 v-if 是"真正"的条件渲染:

1. false → true:创建 DOM、创建组件实例、执行 mounted
2. true → false:执行 beforeUnmount、销毁实例、移除 DOM

而 v-show 只是改一个 CSS 属性。

### Q4:v-if 和 v-for 能一起用吗?

**不推荐!**

- Vue 2:v-for 优先级高,每次都会遍历全部元素
- Vue 3:v-if 优先级高,访问不到 item

**正确做法**:用 computed 先过滤数据。

---

## 10. 总结

**核心记忆点**:

1. **v-if**:条件渲染,真正的销毁/创建
2. **v-show**:样式切换,display: none
3. **首次渲染**:v-if 更优(false 时不渲染)
4. **频繁切换**:v-show 更优(无销毁/创建开销)

**面试答题框架**:

1. **是什么**:v-if 是条件渲染,v-show 是 CSS 切换
2. **区别**:切换开销、初始开销、生命周期
3. **何时用**:少变用 v-if,多变用 v-show
4. **注意**:v-for 优先级、key 复用、transition

记住:**v-if 是"有没有",v-show 是"看不看得见"**。
