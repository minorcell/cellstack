# JS Map 知多少：揭开键值对存储的隐秘角落

## 一、从青铜到王者：为什么我们需要 Map？

在 `JavaScript` 的江湖中，早期存储键值对的主角是 `Object`。但有一个隐患：当你用非字符串作为键时，它会被悄无声息地转换为字符串。例如：

```js
const obj = {};
const key = { id: 1 };
// 实际上，这里 key 被自动转成了 "[object Object]"
obj[key] = "value";

console.log(obj["[object Object]"]); // 'value'
```

这就像把精致的法式甜点塞进破旧塑料袋——优雅的对象在传递过程中被 `toString()` 砸成了平凡的字符串。为了解决这个问题，ES6 引入了 `Map`，给键值存储注入了全新的“钛合金骨骼”。

```js
const map = new Map();
const ironKey = { id: 1 };
map.set(ironKey, "振金盾牌");

console.log(map.get(ironKey)); // 振金盾牌
```

### Map 的六大绝技

1.  **任意类型的键**  
    无论是对象、函数还是 `NaN`，都可以直接作为键，不再受限于字符串。
1.  **保留插入顺序**  
    Map 内部记录了键值对的插入顺序，使得迭代时顺序与添加顺序一致。
1.  **内置 size 属性**  
    直接通过 `map.size` 获取 Map 的容量，无需调用 `Object.keys()` 等方法计算。
1.  **高频操作优化**  
    在处理大量数据时，Map 的性能往往比 Object 更佳，能提升性能 50%+。
1.  **直接迭代支持**  
    使用 `for...of` 遍历 Map，无需额外转换，代码更加简洁。
1.  **纯净的键值存储**  
    Map 不继承 `Object.prototype` 上的属性，避免了原型链带来的副作用。

## 二、Map 的十八般武艺

### 2.1 基础操作解析

下面的例子演示了如何通过数组初始化 `Map`，并使用常见的 API（`set`、`delete`、`has`、`size`）进行操作：

```js
const jediCouncil = new Map([
  [Yoda, "Master"],
  [MaceWindu, "Council Head"],
]);

// 添加新的键值对，同时可以链式调用 set
jediCouncil.set(Anakin, "Chosen One");
// 删除刚添加的键，象征着黑暗面的诱惑
jediCouncil.delete(Anakin);

console.log(jediCouncil.has(Yoda)); // true，判断 Yoda 是否存在
console.log(jediCouncil.size); // 2，当前 Map 中的键值对数量
```

### 2.2 迭代的艺术

Map 提供了多种迭代方式，让你可以轻松遍历键、值或键值对：

```js
// 使用 for...of 直接遍历键值对，书写简洁又直观
for (const [jedi, title] of jediCouncil) {
  console.log(`${jedi.name}: ${title}`);
}

// 使用 keys() 方法获得键的迭代器，可以按需调用 next() 获取下一个键
const forcePowers = jediCouncil.keys();
const nextJedi = forcePowers.next().value;
```

### 2.3 实战案例：LRU 缓存

利用 `Map` 保持插入顺序的特性，我们可以简单实现一个 `LRU`（最近最少使用）缓存。下面的代码展示了基本的 `get` 与 `put` 操作：

```js
class LRUCache {
  constructor(capacity) {
    this.cache = new Map();
    this.capacity = capacity;
  }

  get(key) {
    // 如果缓存中不存在该 key，返回 -1
    if (!this.cache.has(key)) return -1;

    // 获取该 key 的值，然后更新其使用顺序
    const value = this.cache.get(key);
    this.cache.delete(key); // 删除旧位置
    this.cache.set(key, value); // 重新添加到 Map 的末尾，表示最新使用
    return value;
  }

  put(key, value) {
    // 如果 key 已存在，先删除再重新插入
    if (this.cache.has(key)) this.cache.delete(key);
    // 超过容量时，删除最旧的键值对
    if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}
```

## 三、WeakMap：内存管理的绝地武士

当 `Map` 在强引用键时，内存管理有时可能会捉襟见肘。`WeakMap` 则利用弱引用解决了这个问题，一旦没有其他引用指向键对象，垃圾回收器（GC）就会自动将其清理掉。看看这个例子：

```js
let deathStar = { target: "Alderaan" };
const weakMap = new WeakMap();

weakMap.set(deathStar, "operational");

// 当不再需要 deathStar 时，将其置为 null
deathStar = null; // 原力释放！
// 此时，与 deathStar 关联的键值对会在合适的时机被 GC 回收
```

### WeakMap 的三大原力戒律

1.  **键必须是对象**  
    只能使用对象作为键，基本类型（字符串、数字等）不被允许。
1.  **不可遍历**  
    WeakMap 不提供迭代器，因为键可能随时被垃圾回收，保证内存安全。
1.  **无 size 属性**  
    由于键的不确定性，WeakMap 不提供 size 属性，也无法获取所有键值对。

### 实战场景揭秘

#### 1. 私有属性封装

利用 WeakMap 存储实例的私有数据，避免直接暴露内部实现：

```js
const privateData = new WeakMap();

class Jedi {
  constructor(name) {
    // 将私有数据与当前实例绑定
    privateData.set(this, { name });
  }

  get name() {
    return privateData.get(this).name;
  }
}
```

#### 2. DOM 元素元数据管理

在前端开发中，可以使用 WeakMap 为 DOM 元素关联额外的元数据，而无需担心内存泄漏：

```js
const domMetadata = new WeakMap();
const button = document.querySelector("#deathStarBtn");

domMetadata.set(button, {
  clickCount: 0,
  lastClicked: null,
});

button.addEventListener("click", () => {
  const data = domMetadata.get(button);
  data.clickCount++;
  data.lastClicked = new Date();
});
```

## 四、Map vs WeakMap：光明与黑暗的抉择

| 特性          | Map                        | WeakMap                        |
| ------------- | -------------------------- | ------------------------------ |
| **键类型**    | 任意值                     | 仅对象                         |
| **垃圾回收**  | 强引用，键不会自动释放     | 弱引用，键一旦无引用自动回收   |
| **可遍历性**  | 支持迭代                   | 不支持迭代                     |
| **Size 属性** | 提供 size 属性             | 不提供                         |
| **性能**      | 部分场景稍慢               | 在垃圾回收方面更高效           |
| **内存管理**  | 需要手动管理               | 自动释放，防止内存泄漏         |
| **使用场景**  | 长期存储数据，需遍历键值对 | 临时数据存储，关联对象生命周期 |

## 五、灵魂拷问：何时拔出哪把光剑？

- **需要遍历所有键值对** → 使用 **Map**  
  （遍历能力使它在数据结构操作时如虎添翼）
- **处理大量短生命周期数据** → 使用 **WeakMap**  
  （自动内存回收，让你远离手动清理的烦恼）
- **键不仅仅是字符串** → 使用 **Map**  
  （支持对象、函数等任意类型键）
- **希望键与对象生命周期绑定** → 使用 **WeakMap**  
  （一旦对象不再使用，相关数据也随之消失）
- **需要获取集合大小** → 使用 **Map**  
  （size 属性让你一目了然）
- **担心内存泄漏** → 使用 **WeakMap**  
  （自动释放机制为内存保驾护航）

---

在 `JavaScript` 的星辰大海中，`Map` 和 `WeakMap` 分别扮演着数据存储与内存管理的双子星。下次当你准备用 `Object` 存储数据时，不妨停下来思考：是否真的需要一个能够识别任意类型键、内存管理友好的真正“键值对专家”？选择对的工具，才能让你的代码既优雅又高效！

---

## 原文参考

- [MDN - Object#对象原型属性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object#%E5%AF%B9%E8%B1%A1%E5%8E%9F%E5%9E%8B%E5%B1%9E%E6%80%A7)
- [MDN - Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN - WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [What are the actual uses of ES6 WeakMap?](https://stackoverflow.com/questions/29413222/what-are-the-actual-uses-of-es6-weakmap)
