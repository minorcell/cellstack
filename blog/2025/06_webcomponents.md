# 当浏览器也开始"造轮子"：Web Components 的觉醒之旅

## 一、框架的狂欢与原生之痛

前端开发者常陷入这样的循环：为 React 重写日期选择器，为 Vue 重构表单组件，给 Angular 移植图标库——就像被迫携带 Type-C、Lightning、MicroUSB 三根数据线才能保证设备兼容。那些`data-v-xxxx`的样式隔离标记，本质是框架在 DOM 层面打的"隔离补丁"。

Web Components 的提出旨在解决这些问题 — 它由三项主要技术组成：

- **定制基因（Custom Elements）**
- **视觉结界（Shadow DOM）**
- **骨骼模板（HTML Template）**

## **二、拆解 Web Components 三件套**

让我们像组装乐高积木一样，逐步认识 Web Components 的三大核心部件。先从一个最简单的需求开始：**创建一个会打招呼的按钮**。

---

#### **第一步：创造新标签（Custom Elements）**

想象你可以发明新的 HTML 标签，这是 Custom Elements 的能力：

```html
<!-- 页面中直接使用 -->
<hello-button></hello-button>

<script>
  // 定义新元素
  class HelloButton extends HTMLElement {
    constructor() {
      super();
      // 给元素添加内容
      this.textContent = "点击我打招呼";
      this.style.cursor = "pointer";
    }

    // 当元素被添加到页面时
    connectedCallback() {
      this.onclick = () => {
        alert("你好，世界！");
      };
    }
  }

  // 注册新标签（名字必须带短横线）
  customElements.define("hello-button", HelloButton);
</script>
```

**关键点解析**：

1.  `customElements.define()` 像商标注册，告诉浏览器新标签的名字和功能
2.  `connectedCallback` 正如它的名字，是生命周期钩子，类似组件的"上岗"
3.  自定义元素必须继承 `HTMLElement` 基类

---

#### **第二步：封装私有空间（Shadow DOM）**

现在要给按钮添加样式，但不想影响页面其他元素。这就是 Shadow DOM 的用武之地：

```html
<hello-button></hello-button>

<script>
  class HelloButton extends HTMLElement {
    constructor() {
      super();
      // 创建 Shadow DOM 隔离区
      const shadow = this.attachShadow({ mode: "open" });

      // 在隔离区内构建内容
      const button = document.createElement("button");
      button.textContent = "带样式的按钮";
      button.style.backgroundColor = "#4CAF50"; // 绿色背景
      button.style.color = "white";
      button.style.padding = "10px 20px";
      button.style.border = "none";

      shadow.appendChild(button);
    }

    connectedCallback() {
      this.shadowRoot.querySelector("button").onclick = () => {
        alert("样式不会影响其他元素！");
      };
    }
  }

  customElements.define("hello-button", HelloButton);
</script>
```

**关键变化**：

- 使用 `attachShadow()` 创建隔离容器
- 所有样式和 DOM 操作都在 Shadow Root 内进行
- 外部 CSS 无法影响 Shadow DOM 内的元素（试试在页面添加 `button { background: red !important; }`）

**可视化理解**：\
在浏览器开发者工具中：

1.  找到 `<hello-button>` 元素
2.  点击展开旁边的 `#shadow-root`，就像打开一个秘密盒子

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ce059bcac25347acb93b1ae701dcc764~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754618965&x-orig-sign=hej8ng%2F4vi1dsthoFxIfK4hIymQ%3D)

---

#### **第三步：预制模板（HTML Templates）**

第二部中代码也许看上去有些不太美观，这一点就可以用 `<template>` 标签预置 HTML 结构：

```html
<!-- 定义模板 -->
<template id="hello-template">
  <style>
    button {
      background: #2196f3;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      border: none;
      font-size: 16px;
    }
  </style>
  <button><slot>默认文字</slot></button>
</template>

<!-- 使用组件 -->
<hello-button>点击我</hello-button>

<script>
  class HelloButton extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });

      // 获取模板内容
      const template = document.getElementById("hello-template");
      const content = template.content.cloneNode(true); // 深拷贝模板

      shadow.appendChild(content);
    }

    connectedCallback() {
      this.shadowRoot.querySelector("button").addEventListener("click", () => {
        const slotText = this.textContent; // 获取插入的内容
        alert(`你点击了: ${slotText}`);
      });
    }
  }

  customElements.define("hello-button", HelloButton);
</script>
```

**技术亮点**：

- `<slot>` 标签像占位符，允许外部插入内容
- 模板中的样式自动限定在 Shadow DOM 内
- `cloneNode(true)` 复制模板内容，类似复印设计图纸

**进阶实验**：\
尝试在页面中添加多个 `<hello-button>`，观察它们的样式是否互相影响。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/57005dbc3bb2428ebeaf6c6827e15422~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754618965&x-orig-sign=3wzn%2BynVQXIB52Og4NMxtFuhmiA%3D)

---

通过这三步，你完成了：

1.  **发明新标签**（Custom Elements）
2.  **创建私有空间**（Shadow DOM）
3.  **预置组件结构**（HTML Templates）

现在你已经掌握了浏览器原生的组件化能力！下次遇到跨框架组件共享的需求时，不妨试试这套浏览器原生的解决方案。

---

## **三、用 Web Components 复刻 Element Plus 按钮**

让我们用浏览器原生能力，实现一个具备 Element Plus 风格的可定制按钮组件。最终效果将支持以下特性：

- **type 属性**：`primary | success | warning | danger | info`
- **hover 效果**：透明度变化
- **点击事件**：标准 DOM 事件
- **插槽内容**：自定义按钮文字

```html
<!-- 定义组件模板 -->
<template id="el-button-template">
  <style>
    :host {
      display: inline-block;
      --el-button-primary: #409eff;
      --el-button-success: #67c23a;
      --el-button-warning: #e6a23c;
      --el-button-danger: #f56c6c;
      --el-button-info: #909399;
    }

    .el-button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: white;
      transition: opacity 0.3s;
    }

    .el-button:hover {
      opacity: 0.8;
    }

    /* 类型样式映射 */
    .primary {
      background: var(--el-button-primary);
    }
    .success {
      background: var(--el-button-success);
    }
    .warning {
      background: var(--el-button-warning);
    }
    .danger {
      background: var(--el-button-danger);
    }
    .info {
      background: var(--el-button-info);
    }
  </style>

  <button class="el-button">
    <slot>按钮</slot>
  </button>
</template>

<script>
  class ElButton extends HTMLElement {
    static observedAttributes = ["type"];

    constructor() {
      super();
      // 创建 Shadow DOM 并附加模板
      const shadow = this.attachShadow({ mode: "open" });
      const template = document.getElementById("el-button-template");
      shadow.appendChild(template.content.cloneNode(true));

      // 获取按钮元素
      this.button = shadow.querySelector(".el-button");
    }

    // 属性变化监听
    attributeChangedCallback(name, oldVal, newVal) {
      if (name === "type") {
        this.updateButtonType(newVal);
      }
    }

    // 更新按钮类型
    updateButtonType(type) {
      const validTypes = ["primary", "success", "warning", "danger", "info"];
      const finalType = validTypes.includes(type) ? type : "primary";

      // 移除旧类型样式
      this.button.classList.remove(...validTypes);
      // 添加新类型样式
      this.button.classList.add(finalType);
    }

    // 组件挂载时初始化
    connectedCallback() {
      const type = this.getAttribute("type") || "primary";
      this.updateButtonType(type);

      // 绑定点击事件
      this.button.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("click"));
      });
    }
  }

  // 注册自定义元素
  customElements.define("el-button", ElButton);
</script>
```

使用`el-button`：

```html
<!-- 基础使用 -->
<el-button>默认按钮</el-button>

<!-- 指定类型 -->
<el-button type="success">成功按钮</el-button>
<el-button type="danger">危险按钮</el-button>

<!-- 事件监听 -->
<el-button type="warning" id="demo">测试按钮</el-button>

<script>
  document.getElementById("demo").addEventListener("click", () => {
    alert("按钮被点击！");
  });
</script>
```

在页面中的效果如下：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/85d6cbe400f44cc6b2bcc2d404ee6465~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754618965&x-orig-sign=Wk9OsGV7YncaIxxutyEzxkZyNwA%3D)

---

## 参考资料

1.  [MDN Web Components 文档](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)
2.  [Web Components 实战指南](https://webcomponents.dev)
3.  [Web Components 入门实例教程 - 阮一峰](https://www.ruanyifeng.com/blog/2019/08/web_components.html)
