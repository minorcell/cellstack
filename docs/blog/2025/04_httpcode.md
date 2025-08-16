---
title: HTTP 状态码：15 个常见的状态码详解
description: 深入了解 HTTP 状态码的含义和使用场景，掌握前后端交互中的关键信息
date: 2025-01-22
tags:
  - HTTP
  - 状态码
  - 网络协议
  - 前端开发
  - 后端开发
---

# HTTP 状态码：15 个常见的状态码详解

> 作为一名入门开发者，你是不是也遇到过这样的场景：后端小伙伴随手给你丢个 `200` / `400` / `500` ，你就把所有"请求结果"一股脑的`response?.data?.data`？别怕，HTTP 状态码的细分确实不算最"吸睛"的知识点，但真正掌握后，不仅调试能快人一步，还能让前后端心照不宣、默契满分。

## 为什么要认真对待状态码？

1.  **效率更高**  
    正确的状态码能让你一眼看出问题：是参数格式不对？还是权限不够？还是后台真挂了？

1.  **用户体验加分**  
    客户端拿到精确的状态码，可以展示更友好的提示：

    - `401 Unauthorized`：提示"请先登录"，
    - `403 Forbidden`：提示"权限不足"，
    - `404 Not Found`：跳到个定制化的 404 页面。

1.  **团队协作利器**  
    一套统一的状态码规范，比一大堆注释更直观，API 文档也更易维护。

## 五大类状态码一览

| 类别           | 代码范围 | 含义                         | 关键码点                                         |
| -------------- | -------- | ---------------------------- | ------------------------------------------------ |
| **信息响应**   | 100–199  | 已收到请求，正在继续处理     | `100 Continue`                                   |
| **成功响应**   | 200–299  | 请求已成功处理               | `200 OK`、`201 Created`、`204 No Content`        |
| **重定向消息** | 300–399  | 需要客户端进一步操作         | `301 Moved Permanently`、`302 Found`             |
| **客户端错误** | 400–499  | 请求包含错误的语法或无法满足 | `400 Bad Request`、`401`、`403`、`404`、`429`    |
| **服务器错误** | 500–599  | 服务器未完成请求             | `500 Internal Server Error`、`502`、`503`、`504` |

## 信息响应（100–199）："已收到请求，正在继续处理"

- **100 Continue**  
  当客户端大文件上传前，先发送带 `Expect: 100-continue` 的头，服务器回复 `100 Continue` 表示 OK，继续发送主体。

  ```http
  POST /upload HTTP/1.1
  Host: example.com
  Expect: 100-continue

  ← HTTP/1.1 100 Continue

  <file-binary-data>
  ```

- **101 Switching Protocols**  
  用于协议切换（如 HTTP → WebSocket）。

  ```http
  GET /chat HTTP/1.1
  Host: example.com
  Upgrade: websocket
  Connection: Upgrade

  ← HTTP/1.1 101 Switching Protocols
     Upgrade: websocket
     Connection: Upgrade
  ```

- **103 Early Hints**  
  允许在主响应尚未准备好时，通过 `Link` 头预加载资源，提升首屏性能。

  ```http
  HTTP/1.1 103 Early Hints
  Link: </style.css>; rel=preload; as=style
  ```

::: tip

常规 API 场景用得少，除非你做大文件上传/协议升级或追求极致首屏加载。

:::

## 成功响应（200–299）："请求已成功处理"

- **200 OK**  
  "一切正常"，不同方法下含义略有差别：

  - `GET`：返回资源
  - `POST`：返回操作结果
  - `HEAD`：仅返回头部

  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {"id": 123, "name": "mCell"}
  ```

- **201 Created**  
  资源创建成功，响应体或 `Location` 头返回新资源地址。

  ```http
  HTTP/1.1 201 Created
  Location: /projects/456
  Content-Type: application/json

  {"id": 456, "title": "New Project"}
  ```

- **202 Accepted**  
  表示请求已接受但尚未处理完毕，适用于异步任务。

  ```http
  HTTP/1.1 202 Accepted
  Content-Type: application/json

  {"taskId": "abc123", "statusUrl": "/tasks/abc123/status"}
  ```

- **204 No Content**  
  操作成功，但不返回内容。常用于 `PUT`/`DELETE`。

  ```http
  HTTP/1.1 204 No Content
  ```

- **206 Partial Content**  
  支持断点续传或分块下载，通过 `Range` 请求头指定区域。

  ```http
  GET /video.mp4 HTTP/1.1
  Range: bytes=0-999

  ← HTTP/1.1 206 Partial Content
     Content-Range: bytes 0-999/50000
  ```

## 重定向（300–399）："换个地方取资源"

- **301 Moved Permanently**  
  资源永久迁移，SEO 会跟着改指向。

  ```http
  HTTP/1.1 301 Moved Permanently
  Location: https://new.example.com/page
  ```

- **302 Found**  
  临时重定向，浏览器跟去拿新地址，但不更新收藏或搜索索引。

- **303 See Other**  
  通常对 `POST` 请求用 `GET` 去拿别的"确认页"。

  ```http
  HTTP/1.1 303 See Other
  Location: /order/789/confirmation
  ```

- **304 Not Modified**  
  缓存协商命中，告知客户端使用本地缓存即可。

> 调试时留意浏览器缓存，老 301 可能让你追不到最新改动。

## 客户端错误（400–499）："请求包含错误"

- **400 Bad Request**  
  参数格式错了、JSON 语法不合法、必填字段缺失，都归这档。

- **401 Unauthorized**  
  需要身份验证（未登录或令牌过期）。

  ```http
  HTTP/1.1 401 Unauthorized
  WWW-Authenticate: Bearer realm="example"
  ```

- **403 Forbidden**  
  登录了也没用，你没有访问该资源的权限。

- **404 Not Found**  
  请求的地址不存在，自定义 404 页面能提升用户体验。

- **405 Method Not Allowed**  
  客户端使用了不被允许的 HTTP 方法。

- **429 Too Many Requests**  
  频率受限，需要等待 `Retry-After` 指定的秒数再试。

> 建议在全局拦截器统一处理 401/403/429，减少散落项目各处的重复逻辑。

## 服务器错误（500–599）："后台罢工了"

- **500 Internal Server Error**  
  通用报错，通常要查看日志才能定位。
- **502 Bad Gateway**  
  上游服务无响应或返回错误。
- **503 Service Unavailable**  
  临时维护或过载，可带 `Retry-After` 提示下次上线时间。
- **504 Gateway Timeout**  
  网关等待响应超时。
- **505 HTTP Version Not Supported**  
  客户端使用的 HTTP 版本不被支持。

::: tip

监控告警除了状态码，还要打好日志、记录堆栈，才能快速排查。

:::

## 写在最后

1.  **先记常用**：200/201/204、301/302、400/401/403/404/429、500/502/503/504。
1.  **按场景选码**：让 API"说话"更精准，前端能一眼识别各种情况。
1.  **多埋点多日志**：状态码只是第一步，配合日志和链路追踪才是真正的"全息"信息。

掌握 HTTP 状态码，不是死背面试题，而是让你的接口设计更优雅、调试更高效、团队协作更流畅。下次有同学问"为啥不用全 200？"，你就可以教他："那我问你，你 xxxxxxxxx..."

## 引用

1. **RFC**: [Response Status Codes](https://datatracker.ietf.org/doc/html/rfc7231#section-6)
2. **MDN**: [HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status)
