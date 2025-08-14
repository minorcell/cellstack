---
title: Vue 自定义指令：揭开 DOM 操作的神秘面纱
description: 深入探索 Vue 自定义指令的使用场景、生命周期和最佳实践，掌握 DOM 操作的优雅方式
date: 2025-01-19
tags: 
  - Vue
  - 自定义指令
  - DOM操作
  - 前端开发
---

# Vue 自定义指令：揭开 DOM 操作的神秘面纱

在 Vue 里，你大部分时间都在和组件、响应式数据打交道，几乎不需要关心底层的 DOM 操作。但总有那么些时候，Vue 看起来"管得太宽了"，你就是想自己动手改改 DOM，咋办？

你可能会说："直接用 `ref` 然后 `mounted` 里 `el.focus()` 啊！" 行，这确实是个办法。但当你发现自己在多个地方都需要类似的 DOM 操作，代码越来越乱时，你就该问自己："有没有更优雅的方式？"

**答案是：自定义指令 (Custom Directives)。**

## 自定义指令是什么？

Vue 自带了一些指令，比如 `v-model`、`v-show`，它们能让你轻松操作 DOM。但 Vue 不能满足所有场景，比如：

- 你想让某个元素在插入 DOM 时自动获取焦点？
- 你想动态控制元素的颜色、大小？
- 你想在某个元素被销毁前执行一些额外的操作？

组件？可以，但未免有点杀鸡用牛刀。

`watch`？行，但代码还是很散。

于是 Vue 说："来，给你个工具，自己造个轮子。"

## 你的第一个指令

咱们先写个简单的 `v-highlight` 指令，给文本加个高亮：

```ts
<script setup>
const vHighlight = {
  mounted: (el) => {
    el.classList.add('is-highlight')
  }
}
</script>

<template>
  <p v-highlight>这句话很重要！</p>
</template>
```

**Boom!** 这个 `p` 标签现在每次渲染时都会自动添加 `is-highlight` 类，你不用每次都手动写 `class` 了。

### 旧语法版（非 `<script setup>`）

如果你是老 Vue 用户，可以这样写：

```ts
export default {
  directives: {
    highlight: {
      mounted(el) {
        el.classList.add("is-highlight");
      },
    },
  },
};
```

甚至可以全局注册，让所有组件都能用：

```
const app = createApp({})

app.directive('highlight', {
  mounted(el) {
    el.classList.add('is-highlight')
  }
})
```

## 深入指令生命周期

Vue 组件有生命周期，自定义指令也有自己的生命周期：

```ts
const myDirective = {
  created(el, binding, vnode) {},
  beforeMount(el, binding, vnode) {},
  mounted(el, binding, vnode) {},
  beforeUpdate(el, binding, vnode, prevVnode) {},
  updated(el, binding, vnode, prevVnode) {},
  beforeUnmount(el, binding, vnode) {},
  unmounted(el, binding, vnode) {},
};
```

举个更实际的例子，我们做个 `v-focus` 指令，让 `input` 自动聚焦：

```ts
<script setup>
const vFocus = {
  mounted: (el) => el.focus()
}
</script>

<template>
  <input v-focus />
</template>
```

比 `autofocus` 更强，因为它不仅能在页面加载时生效，还能在 `v-if` 切换时生效。

## 传参、修饰符与动态参数

你可以给指令传值，比如改变颜色：

```html
<template>
  <p v-color="'red'">这段文字会变红</p>
</template>
```

```ts
app.directive("color", (el, binding) => {
  el.style.color = binding.value;
});
```

多个参数？对象字面量来帮你：

```html
<template>
  <p v-style="{ color: 'blue', fontSize: '20px' }">这段文字蓝色且更大</p>
</template>
```

```ts
app.directive("style", (el, binding) => {
  Object.assign(el.style, binding.value);
});
```

动态参数也 OK：

```html
<template>
  <p v-example:[arg]="value"></p>
</template>
```

如果 `arg` 是 `'color'`，那么 `v-example:color="'green'"` 实际上等于 `binding.arg === 'color'`。

## 什么时候不该用自定义指令？

Vue 已经有 `v-bind`、`v-model` 这些强大的工具，所以如果能用它们，尽量别写指令。

### 多根组件问题

尤其是 **组件根节点**，不要滥用指令。例如：

```html
<template>
  <MyComponent v-demo="test" />
</template>
```

如果 `MyComponent` 是多根组件（即它的模板包含多个根级元素）：

```html
<template>
  <div>部分 1</div>
  <div>部分 2</div>
</template>
```

那么 `v-demo` 可能会失效，甚至 Vue 会直接警告你。因为 Vue 的指令默认只应用到 **组件的根元素**，而这个组件有多个根元素，Vue 无法决定到底该把指令应用到哪个元素上。

## 常见的自定义指令示例

```ts
// 自动聚焦
const vFocus = {
  mounted: (el) => el.focus(),
};

// 设置元素颜色
const vColor = {
  mounted: (el, binding) => {
    el.style.color = binding.value;
  },
};

// 监听点击外部事件
const vClickOutside = {
  mounted(el, binding) {
    el.__clickOutsideHandler__ = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.__clickOutsideHandler__);
  },
  unmounted(el) {
    document.removeEventListener("click", el.__clickOutsideHandler__);
  },
};
```

## 结语

自定义指令是 Vue 里最接近"底层操作"的 API 之一。它的用武之地在于：

1.  **必须直接操作 DOM**，`ref` 或 `watch` 都不好使的情况。
1.  **封装可复用的行为**，避免到处 `querySelector`。
1.  **增强可读性**，让模板代码更清晰。

但请记住：如果 Vue 内置的方式能解决问题，就不要引入额外的复杂性。**写代码是一门权衡的艺术。**

如果下次你又想在 Vue 中使用 `document.querySelector`，试试写个指令，说不定能让你的代码更优雅 😉。