---
title: IndexedDB 前端数据库完全指南：从入门到实战的本地存储方案
description: 最详细的 IndexedDB 前端数据库教程，深入讲解浏览器本地数据库 API 的使用方法。相比 localStorage 具备事务处理、索引查询、大容量存储等高级功能，是构建离线应用、PWA 应用的首选本地存储方案。
tags:
  - IndexedDB
  - 前端数据库
  - 本地存储
  - 浏览器API
  - 离线应用
  - PWA
  - 前端存储
  - Web存储
  - 结构化数据
  - 事务处理
  - 索引查询
  - JavaScript数据库
author: mCell
date: 2024-12-01
lastUpdated: 2024-12-01
---

![012.png](/public/images/2025/012.png)

# IndexedDB 前端数据库实战指南

> IndexedDB 是浏览器提供的本地数据库 API，支持存储大量结构化数据。相比 localStorage，它具备事务处理、索引查询等高级功能，是构建离线应用的首选方案。

## 为什么选择 IndexedDB？

### 前端存储方案对比

| 特性         | IndexedDB     | LocalStorage |
| ------------ | ------------- | ------------ |
| **存储容量** | 可达数百 MB   | 5MB 左右     |
| **异步操作** | 非阻塞        | 同步阻塞     |
| **查询能力** | 索引/范围查询 | 仅键值查询   |
| **事务支持** | ACID 特性     | 无事务       |

> **决策指南**：
>
> - 用户偏好/小数据 → localStorage
> - **离线应用/大型数据集 → IndexedDB**
> - 运行时状态 → Redux/Zustand

## 学生管理系统实战

### 核心实现要点

1. **数据库初始化**（创建对象存储与索引）

```js
// 创建学生数据库
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore("students", {
    keyPath: "id",
    autoIncrement: true,
  });

  // 创建查询索引
  store.createIndex("name_idx", "name");
  store.createIndex("grade_idx", "grade");
};
```

2. **模式化操作封装**

```js
// 添加学生（返回Promise）
async function addStudent(student) {
  const store = await getStore("readwrite");
  return promisify(store.add(student));
}

// 按成绩范围查询
async function getByGrade(min, max) {
  const store = await getStore();
  const index = store.index("grade_idx");
  return promisify(index.getAll(IDBKeyRange.bound(min, max)));
}
```

## 使用 idb 库简化开发

原生 API 较冗长，推荐 Jake Archibald 开发的 [idb 库](https://github.com/jakearchibald/idb)：

```bash
pnpm add idb
```

### 操作对比示例

```js
// 原生 vs idb 查询对比
// 原生
const store = transaction.objectStore("students");
const request = store.getAll();

// idb
const db = await openDB("StudentDB");
const students = await db.getAll("students");
```

### idb 核心优势：

- Promise 化 API（告别回调地狱）
- 事务自动管理
- 类型安全（TS 支持）
- 轻量（1KB gzipped）

---

## 最佳实践建议

1. **数据版本迁移**

```js
upgrade(db, oldVersion) {
  if (oldVersion < 2) {
    const store = tx.objectStore('students');
    store.createIndex('email_idx', 'email');
  }
}
```

2. **错误处理模板**

```js
async function safeDBOp(operation) {
  try {
    return await operation();
  } catch (error) {
    console.error("DB操作失败:", error);
    // 重试/降级逻辑
  }
}
```

3. **性能优化**：
   - 批量操作使用单事务
   - 大型数据集使用游标分批处理
   - 高频数据添加内存缓存层
