---
title: 探索 JS 异步编程：从 setTimeout 到生成器的六种定时实现
description: 以“每秒打印一个数字”为引，本文深入剖析了 JavaScript 中实现定时任务的六种核心方法。从经典的闭包问题到现代的 async/await，再到生成器与函数式编程，带你领略 JS 异步编程的演进与魅力。
date: 2025-01-21
tags:
  - JavaScript
  - 异步编程
  - Promise
  - 生成器函数
  - 定时器
---

# 探索 JS 异步编程：从 setTimeout 到生成器的六种定时实现

> 本文将摒弃 Web API (`requestAnimationFrame`)，纯粹在 Node 运行环境中，由浅入深地探讨六种实现方案，展示不同编程范式下的巧思。

“每秒打印一个数字”——这个看似简单的编程任务，是衡量 JavaScript 开发者对异步编程理解程度的一块绝佳试金石。不仅考察了对定时器的掌握，更能引出闭包、Promise、async/await、生成器乃至函数式编程等核心概念。

### 方案一：经典的 `setTimeout` 与闭包

这是最容易想到的方案，但也暗藏着最容易遇到的“闭包陷阱”。

```javascript
function printNumbersWithTimeout() {
  for (let i = 1; i <= 10; i++) {
    setTimeout(() => {
      console.log(i);
    }, i * 1000);
  }
}
```

**核心思路：**
通过一次循环，同时启动 10 个定时器。通过将延迟时间设置为 `i * 1000`，巧妙地让它们在不同的时间点（第 1 秒、第 2 秒……）触发，从而实现顺序打印。

**关键点解析：**

- **`let` 的作用**：在这里，使用 `let` 声明 `i` 至关重要。在每次循环中，`let` 都会创建一个新的块级作用域，因此每个 `setTimeout` 的回调函数都“捕获”了一个独立的 `i` 变量。
- **如果使用 `var` 会怎样？** 若将 `let` 换成 `var`，由于 `var` 是函数作用域且存在变量提升，所有回调函数将共享同一个 `i`。当定时器触发时，循环早已结束，此时 `i` 的值已变为 `11`，导致最终会连续打印十个 `11`。这是经典的“循环中闭包”问题。

### 方案二：`setInterval` 状态管理

`setInterval` 提供了一种更“状态化”的实现方式，它创建一个唯一的、重复执行的定时任务。

```javascript
function printNumbersWithInterval() {
  let i = 1;
  const intervalId = setInterval(() => {
    console.log(i);
    i++;
    if (i > 10) {
      clearInterval(intervalId); // 必须清除定时器
    }
  }, 1000);
}
```

**核心思路：**
启动一个每秒执行一次的“节拍器”。在每次节拍触发时，打印当前计数器的值，然后递增计数器。当计数器达到目标后，销毁这个节拍器。

**关键点解析：**

- **状态维护**：此方法需要一个外部变量 `i` 来追踪当前的状态（打印到第几个数）。
- **及时清理**：`clearInterval(intervalId)` 是不可或缺的一步。忘记清理会导致定时器在后台永久运行，造成内存泄漏和不必要的计算资源浪费。在组件化开发（如 React, Vue）中，这尤其重要，通常需要在组件卸载时执行清理。

### 方案三：递归 `setTimeout` 的精准控制

使用递归的方式来链接每一次的 `setTimeout`，这是一种比 `setInterval` 更健壮的模式。

```javascript
function printNumbersWithRecursion(i = 1) {
  if (i > 10) return; // 递归的终止条件

  console.log(i);

  setTimeout(() => {
    printNumbersWithRecursion(i + 1);
  }, 1000);
}
```

**核心思路：**
执行当前任务（打印数字），然后设置一个定时器，在 1 秒后调用自身并传入下一个数字。这个过程形成了一条“执行-\>等待-\>执行”的递归链。

**关键点解析：**

- **执行间隔更精确**：`setInterval` 的问题在于，它会严格按照设定的间隔时间将回调函数推入事件队列，而不关心上一个任务是否执行完毕。如果任务执行时间超过间隔时间，可能导致任务堆积。而递归 `setTimeout` 确保了只有在当前任务完成后，才会规划下一次任务，两次任务的**间隔**至少为 1 秒，避免了任务重叠。
- **终止条件**：递归必须有明确的终止条件 (`if (i > 10) return;`)，否则将导致无限递归，最终可能耗尽调用栈（尽管此处因为异步不会直接栈溢出）。

### 方案四：`Promise` 与 `async/await` 的同步化表达

`async/await` 是 ES7 引入的语法糖，用它可以让异步代码的编写方式无限接近于同步代码，极大地提升了可读性。

```javascript
// 首先，封装一个可暂停执行的 sleep 函数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printNumbersWithAsyncAwait() {
  for (let i = 1; i <= 10; i++) {
    await sleep(1000); // 等待1秒
    console.log(i);
  }
}
```

**核心思路：**
将延时操作封装成一个返回 `Promise` 的 `sleep` 函数。在 `async` 函数内部，通过 `await` 关键字暂停 `for` 循环的执行，直到 `sleep` 函数的 `Promise` 状态变为 `resolved` 后再继续下一次循环。

**关键点解析：**

- **异步代码同步化**：这是 `async/await` 最大的优势。代码从上到下执行，逻辑清晰，没有回调地狱。
- **`await` 的本质**：`await` 实际上是暂停了 `async` 函数的执行，并交出了执行权。它并不会阻塞整个 JavaScript 线程。

### 方案五：生成器函数（Generator）的迭代控制

生成器函数提供了一种更精细的控制函数执行流程的方式，它可以被看作是状态机或可暂停的函数。

```javascript
function* numberGenerator() {
  for (let i = 1; i <= 10; i++) {
    // 暂停并产出一个 Promise
    yield new Promise((resolve) =>
      setTimeout(() => {
        console.log(i);
        resolve();
      }, 1000)
    );
  }
}

async function printNumbersWithGenerator() {
  // 遍历生成器产出的每一个 Promise
  for (const promise of numberGenerator()) {
    await promise; // 等待当前 Promise 完成
  }
}
```

**核心思路：**
生成器函数 `numberGenerator` 并不直接执行打印，而是在每次循环时 `yield`（产出）一个包含了定时打印逻辑的 `Promise`。外部的 `async` 函数通过 `for...of` 循环来消费这些 `Promise`，每次 `await` 一个，从而驱动生成器一步步执行。

**关键点解析：**

- **执行控制权的反转**：生成器将执行的控制权交给了调用方。调用方决定何时通过 `next()`（或在 `for...of` 中隐式调用）来继续执行。
- **异步迭代**：这个模式完美地展示了如何将一个迭代器与异步操作结合。它也是 ES2018 中引入的“异步迭代器”（`for await...of`）的前身和思想基础。

### 方案六：`Array.reduce` 的函数式编程风格

最后，我们来看一种利用函数式编程思想，通过 `reduce` 方法动态构建 Promise 链的精妙实现。

```javascript
function printNumbersWithReduce() {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  numbers.reduce((promiseChain, currentNumber) => {
    return promiseChain.then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(currentNumber);
          resolve();
        }, 1000);
      });
    });
  }, Promise.resolve());
}
```

**核心思路：**
将一个数字数组 `[1, 2, ..., 10]` 通过 `reduce` 方法，“折叠”成一个顺序执行的 Promise 链。`reduce` 的初始值是一个立即 resolved 的 `Promise`。在每次迭代中，我们通过 `.then()` 在上一个 `Promise` 完成后，追加一个新的、包含延时打印逻辑的 `Promise`。

**关键点解析：**

- **动态 Promise 链**：这种写法的核心是动态构建一个 `p.then(() => p1).then(() => p2)...` 的链条，确保了任务的严格串行化。
- **函数式思维**：它体现了函数式编程中数据转换和组合的思想，代码高度声明式，虽然初看可能较为费解，但逻辑严谨且内聚。

### 总结与对比

| 方案                  | 实现方式                    | 优点                                            | 缺点 / 注意事项                                  |
| :-------------------- | :-------------------------- | :---------------------------------------------- | :----------------------------------------------- |
| **`setTimeout` 循环** | 一次性启动多个延时任务      | 简单直观，代码量少                              | 需注意 `let` 和 `var` 作用域差异，避免闭包陷阱   |
| **`setInterval`**     | 单个重复任务，状态管理      | 内存占用稳定，逻辑集中                          | 任务可能堆积，必须手动清理以防内存泄漏           |
| **递归 `setTimeout`** | 链式调用，任务自我延续      | 间隔精确，避免任务堆积，比 `setInterval` 更健壮 | 需要设计好递归终止条件                           |
| **`async/await`**     | 同步化书写异步代码          | **可读性极高**，符合直觉，是现代 JS 异步首选    | 需要额外封装 `sleep` 函数，依赖 `Promise`        |
| **生成器函数**        | 迭代器模式，手动控制流程    | 控制粒度精细，是理解异步迭代器的基础            | 概念相对复杂，代码冗余度稍高                     |
| **`Array.reduce`**    | 函数式编程，构建 Promise 链 | 代码精炼，声明式，展示了函数式组合能力          | **可读性较差**，对新手不友好，不建议在业务中滥用 |

### 参考文档

- [MDN: 数组的 reduce 方法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- [MDN: Promise 异步编程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [面试官：你可以终止 forEach 吗？](https://juejin.cn/post/7380942251411226659?searchId=202503302032262C8FF11FB96465422772)
