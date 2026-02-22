---
title: 'Vue Router 原理：SPA 路由的实现'
description: '深入理解 Hash 模式和 History 模式的原理、路由守卫执行顺序、动态路由与路由懒加载,以及导航解析流程'
date: 2025-01-30
order: 11
---

> Vue Router 是面试的高频考点,你需要理解:
>
> - Hash 模式和 History 模式有什么区别?
> - 路由守卫的执行顺序是怎样的?
> - 如何实现路由懒加载?
> - SPA 路由的底层原理是什么?
>
> 这一篇我们把 **路由模式、导航守卫、路由原理** 讲透。

---

## 1. SPA 路由的核心原理

### 1.1 传统 MPA vs SPA

**多页应用(MPA)**:

```text
/home.html   → 服务器返回 home.html
/about.html  → 服务器返回 about.html
```

- ✅ SEO 友好
- ❌ 每次跳转都刷新页面,体验差

**单页应用(SPA)**:

```text
/home   → JS 拦截,渲染 Home 组件
/about  → JS 拦截,渲染 About 组件
```

- ✅ 无刷新切换,体验好
- ❌ 首屏加载慢,SEO 较差

### 1.2 SPA 路由的两大核心

1. **监听 URL 变化**:Hash 或 History API
2. **渲染对应组件**:根据路由表匹配组件

---

## 2. Hash 模式:基于 URL 的 # 号

### 2.1 原理

```text
http://example.com/#/home
http://example.com/#/about
```

**核心**:

- URL 中 `#` 后面的部分叫 **hash**
- hash 变化**不会触发页面刷新**
- 通过 `hashchange` 事件监听 hash 变化

### 2.2 简易实现

```js
class HashRouter {
  constructor(routes) {
    this.routes = routes // 路由表
    this.currentPath = '/'

    // 监听 hash 变化
    window.addEventListener('hashchange', () => {
      this.currentPath = window.location.hash.slice(1) || '/'
      this.render()
    })

    // 页面加载时触发一次
    window.addEventListener('load', () => {
      this.currentPath = window.location.hash.slice(1) || '/'
      this.render()
    })
  }

  render() {
    const route = this.routes.find((r) => r.path === this.currentPath)
    if (route) {
      document.getElementById('app').innerHTML = route.component
    }
  }
}

// 使用
const router = new HashRouter([
  { path: '/', component: '<h1>Home</h1>' },
  { path: '/about', component: '<h1>About</h1>' },
])
```

### 2.3 优缺点

**优点**:

- ✅ 兼容性好(IE 8+)
- ✅ 无需服务器配置
- ✅ hash 不会发送到服务器

**缺点**:

- ❌ URL 中有 `#`,不美观
- ❌ SEO 不友好(搜索引擎可能忽略 hash)

---

## 3. History 模式:基于 HTML5 History API

### 3.1 原理

```text
http://example.com/home
http://example.com/about
```

**核心 API**:

```js
// 跳转(不刷新页面)
history.pushState(state, title, url)

// 替换(不刷新页面)
history.replaceState(state, title, url)

// 监听浏览器前进/后退
window.addEventListener('popstate', (event) => {
  console.log('URL 变化:', location.pathname)
})
```

### 3.2 简易实现

```js
class HistoryRouter {
  constructor(routes) {
    this.routes = routes
    this.currentPath = location.pathname

    // 监听浏览器前进/后退
    window.addEventListener('popstate', () => {
      this.currentPath = location.pathname
      this.render()
    })

    // 拦截所有 <a> 标签点击
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault()
        const path = e.target.getAttribute('href')
        this.push(path)
      }
    })

    this.render()
  }

  push(path) {
    history.pushState(null, '', path)
    this.currentPath = path
    this.render()
  }

  render() {
    const route = this.routes.find((r) => r.path === this.currentPath)
    if (route) {
      document.getElementById('app').innerHTML = route.component
    }
  }
}
```

### 3.3 服务器配置(重要!)

**问题**:用户直接访问 `http://example.com/about`,服务器找不到 `about.html`,返回 404。

**解决**:配置服务器,所有路由都返回 `index.html`。

**Nginx 配置**:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Node.js (Express)**:

```js
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})
```

### 3.4 优缺点

**优点**:

- ✅ URL 美观,无 `#`
- ✅ SEO 友好(配合 SSR)

**缺点**:

- ❌ 需要服务器配置
- ❌ IE 9+ 才支持

---

## 4. Vue Router 基本使用

### 4.1 安装和配置

```bash
npm install vue-router@4
```

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'), // 懒加载
  },
]

const router = createRouter({
  history: createWebHistory(), // History 模式
  // history: createWebHashHistory(), // Hash 模式
  routes,
})

export default router
```

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

### 4.2 路由跳转

**声明式导航**:

```vue
<router-link to="/">Home</router-link>
<router-link to="/about">About</router-link>

<!-- 命名路由 -->
<router-link :to="{ name: 'About' }">About</router-link>

<!-- 带参数 -->
<router-link :to="{ name: 'User', params: { id: 123 } }">User</router-link>

<!-- 带查询参数 -->
<router-link :to="{ path: '/search', query: { keyword: 'vue' } }">
  Search
</router-link>
```

**编程式导航**:

```js
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转
router.push('/about')
router.push({ name: 'About' })
router.push({ path: '/user', query: { id: 123 } })

// 替换(不产生历史记录)
router.replace('/about')

// 前进/后退
router.go(1) // 前进
router.go(-1) // 后退
router.back() // 等同于 go(-1)
```

---

## 5. 动态路由与路由参数

### 5.1 动态路由匹配

```js
const routes = [
  {
    path: '/user/:id', // :id 是动态参数
    component: User,
  },
]
```

**获取参数**:

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

console.log(route.params.id) // 123
</script>
```

**监听参数变化**:

```vue
<script setup>
import { watch } from 'vue'

watch(
  () => route.params.id,
  (newId) => {
    console.log('参数变化:', newId)
    fetchUser(newId)
  },
)
</script>
```

### 5.2 查询参数

```js
// URL: /search?keyword=vue&page=2

route.query.keyword // 'vue'
route.query.page // '2'
```

### 5.3 通配符路由

```js
const routes = [
  {
    path: '/:pathMatch(.*)*', // 匹配所有路径
    name: 'NotFound',
    component: NotFound,
  },
]
```

---

## 6. 路由守卫(导航守卫)

### 6.1 全局守卫

```js
// router/index.js
const router = createRouter({
  /*...*/
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('导航前:', from.path, '→', to.path)

  // 检查登录
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login') // 跳转到登录页
  } else {
    next() // 继续导航
  }
})

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  console.log('所有组件内守卫和异步路由组件都解析完成')
  next()
})

// 全局后置守卫
router.afterEach((to, from) => {
  console.log('导航完成')
  // 不接受 next,无法取消导航
  document.title = to.meta.title || 'App'
})
```

### 6.2 路由独享守卫

```js
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (isAdmin()) {
        next()
      } else {
        next('/403')
      }
    },
  },
]
```

### 6.3 组件内守卫

```vue
<script>
export default {
  beforeRouteEnter(to, from, next) {
    // 组件渲染前调用
    // 此时 this 不可用
    next((vm) => {
      // 通过 vm 访问组件实例
    })
  },
  beforeRouteUpdate(to, from, next) {
    // 路由参数变化时调用(复用组件)
    // 此时 this 可用
    this.fetchData(to.params.id)
    next()
  },
  beforeRouteLeave(to, from, next) {
    // 离开组件时调用
    const answer = window.confirm('确定要离开吗?')
    if (answer) {
      next()
    } else {
      next(false) // 取消导航
    }
  },
}
</script>
```

**Composition API 写法**:

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteUpdate((to, from) => {
  console.log('路由更新')
})

onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('确定要离开吗?')
  return answer // 返回 false 取消导航
})
</script>
```

### 6.4 完整的导航解析流程(高频考点)

```text
1. 导航被触发
2. 在失活的组件里调用 beforeRouteLeave
3. 调用全局的 beforeEach
4. 在重用的组件里调用 beforeRouteUpdate
5. 在路由配置里调用 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局的 beforeResolve
9. 导航被确认
10. 调用全局的 afterEach
11. 触发 DOM 更新
12. 用 next 传给 beforeRouteEnter 的回调函数
```

**记忆口诀**:

```text
离开守卫 → 全局前置 → 复用组件更新 → 路由独享 → 解析异步 → 进入守卫 → 全局解析 → 全局后置
```

---

## 7. 路由懒加载

### 7.1 基本用法

```js
const routes = [
  {
    path: '/about',
    // ✅ 懒加载:打包时会分离成单独的 chunk
    component: () => import('@/views/About.vue'),
  },
]
```

**打包结果**:

```text
dist/
├── index.html
├── js/
│   ├── app.js        # 主包
│   ├── about.js      # About 页面的 chunk
│   └── user.js       # User 页面的 chunk
```

### 7.2 分组打包

```js
const routes = [
  {
    path: '/about',
    component: () =>
      import(/* webpackChunkName: "group-foo" */ '@/views/About.vue'),
  },
  {
    path: '/contact',
    component: () =>
      import(/* webpackChunkName: "group-foo" */ '@/views/Contact.vue'),
  },
]
// About 和 Contact 会打包到同一个 chunk (group-foo.js)
```

---

## 8. 嵌套路由

```js
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: '', // 默认子路由
        component: UserHome,
      },
      {
        path: 'profile', // 访问 /user/:id/profile
        component: UserProfile,
      },
      {
        path: 'posts', // 访问 /user/:id/posts
        component: UserPosts,
      },
    ],
  },
]
```

```vue
<!-- User.vue -->
<template>
  <div>
    <h1>User {{ $route.params.id }}</h1>
    <router-link :to="`/user/${$route.params.id}/profile`">Profile</router-link>
    <router-link :to="`/user/${$route.params.id}/posts`">Posts</router-link>

    <!-- 子路由渲染位置 -->
    <router-view />
  </div>
</template>
```

---

## 9. 面试高频问题

### Q1:Hash 模式和 History 模式的区别?

| 特性       | Hash 模式             | History 模式        |
| ---------- | --------------------- | ------------------- |
| URL 形式   | `example.com/#/about` | `example.com/about` |
| 原理       | hashchange 事件       | pushState/popstate  |
| 兼容性     | IE 8+                 | IE 10+              |
| 服务器配置 | 无需                  | 需要                |
| SEO        | 较差                  | 较好                |

### Q2:路由守卫的执行顺序?

```text
beforeRouteLeave → beforeEach → beforeRouteUpdate → beforeEnter
→ beforeRouteEnter → beforeResolve → afterEach
```

### Q3:如何实现路由懒加载?

```js
component: () => import('@/views/About.vue')
```

**原理**:Webpack 的 `import()` 动态导入,打包时代码分割。

### Q4:路由参数变化时,组件不更新怎么办?

**问题**:从 `/user/1` → `/user/2`,组件被复用,不触发生命周期。

**解决方案 1**:监听参数变化

```js
watch(
  () => route.params.id,
  (newId) => {
    fetchData(newId)
  },
)
```

**解决方案 2**:使用 key

```vue
<router-view :key="$route.fullPath" />
```

**解决方案 3**:使用 beforeRouteUpdate

```js
beforeRouteUpdate(to, from, next) {
  this.fetchData(to.params.id)
  next()
}
```

---

## 10. 总结

**Vue Router 核心知识点**:

1. **路由模式**:Hash(兼容好) vs History(URL 美观,需服务器配置)
2. **导航守卫**:全局 → 路由独享 → 组件内
3. **路由懒加载**:动态 import,代码分割
4. **动态路由**:`:id` 参数,监听参数变化

**面试答题框架**:

1. **是什么**:SPA 路由库,管理页面跳转
2. **怎么做**:Hash(hashchange) / History(pushState)
3. **守卫顺序**:离开 → 全局 → 路由 → 组件
4. **注意**:History 需服务器配置,参数变化组件复用

记住:**路由的本质是监听 URL 变化,渲染对应组件**。
