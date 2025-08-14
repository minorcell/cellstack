---
title: 每秒打印一个数字：从简单到晦涩的多种实现
description: 探索 JavaScript 中实现定时输出数字的多种方案，从 setTimeout 到生成器函数的创意实现
date: 2025-01-21
tags: 
  - JavaScript
  - 异步编程
  - Promise
  - 生成器函数
  - 定时器
---

# 每秒打印一个数字：从简单到晦涩的多种实现

如果你看到标题中的"每秒打印一个数字"，可能已经有了想法，最简单的定时器、在 Web 中使用`requestAnimationFrame`等。但是本文是不打算讲解在 Web 的实现的，我们就用一个简单的例子来看看 JavaScript 中有哪些有趣的实现方式。

---

## 一、setTimeout 方案

首先，让我们用 `setTimeout` 实现这个需求：

```js
function printNumberWithTimeout() {
  for (let i = 1; i <= 10; i++) {
    setTimeout(() => {
      console.log(i);
    }, i * 1000);
  }
}
```

**思考一下：**

- **为什么需要 `i * 1000`？**  
  每次循环时，我们都设置了一个延时任务。把延时乘以 `i`，就实现了每个数字间隔 1 秒的效果。
- **注意什么？**  
  使用 `let` 声明 `i` 能确保每个 `setTimeout` 回调拿到正确的数字。如果用 `var`，由于变量提升和函数作用域问题，结果可能就不对了。

这种方法直白简单，就像是在某一刻开了十个定时器，只不过这十个定时器执行的时间都不一样，是`i * 1000`。

---

## 二、setInterval 方案

接下来，换个角度，我们用 `setInterval` 实现：

```js
function printNumberWithInterval() {
  let i = 1;
  const intervalId = setInterval(() => {
    console.log(i);
    i++;
    if (i > 10) {
      clearInterval(intervalId);
    }
  }, 1000);
}
```

**和大家聊聊：**

- **每秒一响**  
  `setInterval` 就像是闹钟，每隔 1 秒敲响一次。这里我们依靠计数器 `i` 来决定什么时候该停下闹钟。
- **清理的重要性**  
  当数字超过 10 后，我们调用 `clearInterval`。这一步就像在告诉闹钟，"够了，暂停吧"。

这种方法更加直观，就像一个持续响铃的时钟，当然，及时"关闹钟"是防止内存泄露的关键。

---

## 三、递归方式

有没有想过用递归来"接力"打印数字呢？试试这个方法：

```js
function printNumberWithRecursion(i = 1) {
  if (i > 10) return;
  console.log(i);
  setTimeout(() => {
    printNumberWithRecursion(i + 1);
  }, 1000);
}
```

**思路互动：**

- **递归的魅力**  
  每次打印后，通过 `setTimeout` 调用自身，达到"接力赛"的效果。每次等待 1 秒后，递归就带着新的数字重新上场。
- **递归终止条件**  
  别忘了给递归加上出口（`if (i > 10) return;`），否则它会永不停歇。

---

## 四、Promise 与 async/await

随着异步编程越来越流行，利用 Promise 和 async/await 的方式也显得尤为优雅：

```js
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printNumberWithPromise() {
  for (let i = 1; i <= 10; i++) {
    await sleep(1000);
    console.log(i);
  }
}
```

**你可能会问：**

- **为何"等待"能让代码看起来更同步？**  
  `await` 会暂停函数的执行直到 Promise 解决（无论是否正确执行），就像让代码排起队来等待上一个任务结束后再继续。

这里是直接通过`await`直接暂停了 for 循环的执行。（之前看到过一篇文章，关于如何是的循环暂停的，感兴趣的小伙伴可以去看看： [面试官：你可以终止 forEach 吗？](https://juejin.cn/post/7380942251411226659?searchId=202503302032262C8FF11FB96465422772)）

---

## 五、生成器函数的妙用

如果你觉得上面的方式太"直白"，那生成器可能会让你眼前一亮：

```js
function* numberGenerator() {
  for (let i = 1; i <= 10; i++) {
    yield new Promise((resolve) =>
      setTimeout(() => {
        console.log(i);
        resolve();
      }, 1000)
    );
  }
}

async function printNumberWithGenerator() {
  const generator = numberGenerator();
  for (const promise of generator) {
    await promise;
  }
}
```

**一起探讨：**

- **生成器和 yield 是如何工作的？**  
  当你调用生成器函数`numberGenerator`时，它并不会立即执行，而是返回一个迭代器对象。每次遇到 `yield`，函数就会暂停，并返回一个 Promise。等你通过 `for...of` 迭代并 `await` 它后，生成器再继续执行。

---

## 六、Array.reduce 的高级玩法

最后，我们用函数式编程中的 `reduce` 来串联 Promise，这可能是最"隐晦"的一种写法了：

```js
function printWithReduce() {
  Array.from({ length: 10 }, (_, i) => i + 1).reduce(
    (promise, num) =>
      promise.then(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              console.log(num);
              resolve();
            }, 1000)
          )
      ),
    Promise.resolve()
  );
}
```

**让我们拆解这个思路：**

- **从数组到 Promise 链**  
  首先，通过 `Array.from` 生成数字数组。接着，用 `reduce` 把这个数组变成一个 Promise 链。你可以把每个 Promise 看作是链条上的一环，前一环完成后才启动下一环。
- **为什么选择这种方式？**  
  函数式编程的魅力：将一系列操作通过链式调用串联起来，代码虽然看上去"隐晦"，但却精妙地把异步操作变得井然有序。(当然，如果是面试，就当炫技了）

---

## 参考文档

- [MDN: 数组的 reduce 方法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- [MDN: Promise 异步编程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [面试官：你可以终止 forEach 吗？](https://juejin.cn/post/7380942251411226659?searchId=202503302032262C8FF11FB96465422772)