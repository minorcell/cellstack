# 告别轮询！深度剖析 WebSocket：全双工实时通信原理与实战

> 笔者小话：说来，一直挺想写一篇关于 WebSocket 的帖子的，结果因为种种一直鸽子了挺久，最近才想起来，抓紧补一篇，欢迎大家在评论区多多交流。

---

## 摘要

> 你是否还在用轮询（Polling）“打听”最新消息？WebSocket 的到来让 Web 进入真正的“电话时代”。\
> 本文将：
>
> 1.  用生动类比秒懂 WebSocket 与 HTTP 的本质区别；
> 2.  分步拆解 WebSocket 握手／数据帧／断开流程；
> 3.  基于**原生 Go**与**Gorilla WebSocket**，提供两个完整可跑 Demo（「公众号推送」示例与「微信群聊」示例），手把手教你实现实时推送与多人广播。

![ws.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/23e19b6699f740f5b71dd117d6d5ae31~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754972573&x-orig-sign=td1hRDOwoCZbb93XntlKI1LqA0s%3D)

## 背景与动机

互联网早期，网页如电子报纸，刷新一次才能获得新内容，HTTP 的“请求—响应”模式足够。但今天我们需要：

- **在线协作文档**：敲击实时同步；
- **即时聊天**：消息毫秒级到达；
- **金融行情**：价格闪电更新。

若依旧用轮询，每秒几次请求就“咕咕咕”刷屏，不仅延迟抖动大、带宽浪费严重，还给服务器添堵。WebSocket 便是为此而生，让 Web 真正进入持久、双向、低延迟的“电话时代”。

---

## HTTP vs. WebSocket：寄信 vs. 打电话

|              | HTTP（寄信）           | WebSocket（打电话）          |
| ------------ | ---------------------- | ---------------------------- |
| **连接方式** | 短连接：请求后断开     | 持久连接：一次握手，直到挂断 |
| **通信模型** | 单向：客户端发起       | 全双工：双方随时可发送       |
| **头部开销** | 每次都附带大量 Headers | 握手后仅传递精简数据帧       |
| **适用场景** | 静态页面、资源拉取     | 实时聊天、在线游戏、行情推送 |

---

## 为什么彻底告别轮询？

> **轮询（Polling）** ：客户端不断发“有新消息吗？”的请求。

- **带宽浪费**：每次都要传输完整 HTTP 头，远超实际小消息大小。
- **延迟抖动**：只能按固定间隔更新，间隔之外的消息只能等到下一轮请求。
- **服务器压力**：N 个客户端 → N 倍无效请求，后端压力山大。

相比之下，WebSocket：

- **一次握手**，后续通信皆为精简帧；
- **实时双向**，无需轮询即可即时收发；
- **轻量高效**，CPU、带宽利用率显著提升。

---

## WebSocket 握手详解

事实上，WebSocket 并没有另起炉灶，而是借助 http 请求，通过一些字段，告诉对方“我要 WebSocket 协议”，这个过程叫“握手”，我们来看一下这个“握手”流程；

1.  **客户端发起升级请求**

    ```bash
    GET /chat HTTP/1.1
    Host: example.com
    Upgrade: websocket   # 请求升级成websocket协议
    Connection: Upgrade  # 升级！
    Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
    Sec-WebSocket-Version: 13
    ```

    - `Upgrade: websocket` + `Connection: Upgrade`：告诉服务器将协议切换到 WebSocket。

2.  **服务器返回切换协议响应**

    ```http
    HTTP/1.1 101 Switching Protocols
    Upgrade: websocket
    Connection: Upgrade
    Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
    ```

    - **101**：协议切换成功。
    - **Sec-WebSocket-Accept**：对客户端 key + 固定 GUID 做 SHA-1 + Base64，防篡改。

> 握手成功后，底层 TCP 连接正式升级为 WebSocket，无需再走 HTTP。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/39d2934a80cf41a0bf03101e701aeeae~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754972573&x-orig-sign=1bSyoYq69a63FfhAPgV3Nhk5sys%3D)

---

## 数据帧（Frame）— 轻量级的通话内容

Web Socket 通道建立成功之后，数据将会已帧的形式发送。

- **帧组成**：

  1.  **首字节**：FIN（结束标志） + opcode（帧类型：文本／二进制／Ping／Pong／Close）
  2.  **第二字节**：MASK 标志 + Payload 长度
  3.  **掩码 Key**（客户端 → 服务器必须）
  4.  **Payload Data**（真正的消息）

- **示例**：服务器发 “Hello”

  ```bash
  0x81                // FIN=1, opcode=0x1 (文本)
  0x05                // Mask=0 (服务器发包), 长度=5
  0x48 0x65 0x6C 0x6C 0x6F  // “Hello”
  ```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/87f91f24fb824e63a03320711bad6fc5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754972573&x-orig-sign=IQKK9alEuNjNivuKY30eFW6HpX8%3D)

---

## 优雅地挂断︱关闭帧（Close Frame）

- **流程**：任意一方发送 Close Frame → 对方回复 Close Frame → 连接断开。
- **好处**：双向确认“挂断”，避免资源泄漏。

---

## 案例一：简单的实时消息推送（原生 Go）

> **场景类比：「公众号推送」** —— 用户打开页面后，后台每秒更新一句随机短语，类似公众号实时推送消息到订阅者。

### 项目结构

```txt
demo1-push/
├── server.go
└── static/
    └── index.html
```

### 完整后端代码（server.go）

```go
package main

import (
    "crypto/sha1"
    "encoding/base64"
    "log"
    "math/rand"
    "net/http"
    "time"
)

var phrases = []string{
    "这瓜保熟吗？",
    "Go 是世界上最好的语言！",
    "你真是饿了。",
    "自己吓自己！",
    "我发现了石油",
    "因为他善！",
}

func main() {
    http.HandleFunc("/ws", wsHandler)
    http.Handle("/", http.FileServer(http.Dir("./static")))

    log.Println("Server listening on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
    // 1. 校验 Upgrade 请求头
    if r.Header.Get("Connection") != "Upgrade" || r.Header.Get("Upgrade") != "websocket" {
        http.Error(w, "Not a websocket handshake", http.StatusBadRequest)
        return
    }

    // 2. 劫持连接以获取底层 TCP
    hijacker, ok := w.(http.Hijacker)
    if !ok {
        http.Error(w, "Hijacking not supported", http.StatusInternalServerError)
        return
    }
    conn, _, err := hijacker.Hijack()
    if err != nil {
        http.Error(w, "Hijack error", http.StatusInternalServerError)
        return
    }
    defer conn.Close()

    // 3. 完成 WebSocket 握手
    key := r.Header.Get("Sec-WebSocket-Key")
    hash := sha1.New()
    hash.Write([]byte(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"))
    acceptKey := base64.StdEncoding.EncodeToString(hash.Sum(nil))

    response := "HTTP/1.1 101 Switching Protocols\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        "Sec-WebSocket-Accept: " + acceptKey + "\r\n\r\n"
    if _, err := conn.Write([]byte(response)); err != nil {
        log.Println("handshake write error:", err)
        return
    }

    // 4. 发送随机短语
    for {
        msg := phrases[rand.Intn(len(phrases))]
        frame := encodeTextFrame(msg)
        if _, err := conn.Write(frame); err != nil {
            log.Println("write frame error:", err)
            return
        }
        time.Sleep(1 * time.Second)
    }
}

func encodeTextFrame(msg string) []byte {
    data := []byte(msg)
    frame := []byte{0x81, byte(len(data))}
    frame = append(frame, data...)
    return frame
}
```

### 完整前端代码（static/index.html）

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <title>WebSocket 实时消息推送</title>
    <style>
      body {
        font-family: sans-serif;
        padding: 1em;
      }
      #log {
        white-space: pre-line;
        border: 1px solid #ccc;
        padding: 10px;
        height: 300px;
        overflow-y: auto;
      }
    </style>
  </head>
  <body>
    <h2>实时推送消息：</h2>
    <div id="log"></div>
    <script>
      const log = document.getElementById("log");
      const ws = new WebSocket(`ws://${location.host}/ws`);
      ws.onopen = () => (log.textContent += "已连接到服务器\n");
      ws.onmessage = (e) => {
        const now = new Date().toLocaleTimeString();
        log.textContent += `[${now}] ${e.data}\n`;
        log.scrollTop = log.scrollHeight;
      };
      ws.onerror = (e) => (log.textContent += `错误: ${e}\n`);
      ws.onclose = () => (log.textContent += "连接已关闭\n");
    </script>
  </body>
</html>
```

### 运行效果

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/1f37d3849ba34ab295310bc3a03e8839~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754972573&x-orig-sign=uHfGBmXfROfsbjHSUqtd9ctG8lI%3D)

---

## 案例二：「微信群聊」场景的多人广播（Gorilla WebSocket 版）

> **场景类比：「微信群聊」** —— 多个客户端同时在线，A 发消息，B/C/D 都能即时收到，仿佛身处群聊。

### 项目结构

```txt
demo2-chatroom/
├── go.mod
├── server.go
└── static/
    └── index.html
```

#### go.mod

```mod
module demo2-chatroom

go 1.21

require github.com/gorilla/websocket v1.5.0
```

### 完整后端代码（server.go）

```go
package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true }, // 跨域测试用，生产环境请校验
	}
	clients = make(map[*websocket.Conn]bool)
	mu      = sync.Mutex{}
)

func main() {
	http.HandleFunc("/ws", wsHandler)
	http.Handle("/", http.FileServer(http.Dir("./static")))

	log.Println("Chat room server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}
	mu.Lock()
	clients[conn] = true
	log.Printf("Client connected: %s (%d total)\n", conn.RemoteAddr(), len(clients))
	mu.Unlock()

	defer func() {
		mu.Lock()
		delete(clients, conn)
		mu.Unlock()
		conn.Close()
		log.Printf("Client disconnected: %s (%d total)\n", conn.RemoteAddr(), len(clients))
	}()

	for {
		mt, message, err := conn.ReadMessage()
		if err != nil {
			break
		}
		log.Printf("Recv from %s: %s\n", conn.RemoteAddr(), message)

		mu.Lock()
		for c := range clients {
			if c != conn {
				if err := c.WriteMessage(mt, message); err != nil {
					log.Println("write error:", err)
					c.Close()
					delete(clients, c)
				}
			}
		}
		mu.Unlock()
	}
}

```

### 完整前端代码（static/index.html）

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <title>WebSocket 群聊示例</title>
    <style>
      body {
        font-family: sans-serif;
        padding: 1em;
      }
      #log {
        white-space: pre-line;
        border: 1px solid #ccc;
        padding: 10px;
        height: 300px;
        overflow-y: auto;
      }
      input,
      button {
        padding: 8px;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <h2>WebSocket 群聊</h2>
    <div id="log"></div>
    <input id="msg" placeholder="输入消息…" size="50" />
    <button id="sendBtn">发送</button>
    <script>
      const log = document.getElementById("log");
      const input = document.getElementById("msg");
      const ws = new WebSocket(`ws://${location.host}/ws`);

      ws.onopen = () => (log.textContent += "连接已建立\n");
      ws.onmessage = (e) => {
        const now = new Date().toLocaleTimeString();
        log.textContent += `[${now}] 朋友：${e.data}\n`;
        log.scrollTop = log.scrollHeight;
      };
      ws.onclose = () => (log.textContent += "连接已关闭\n");
      ws.onerror = (e) => (log.textContent += `错误: ${e}\n`);

      document.getElementById("sendBtn").onclick = () => {
        const txt = input.value.trim();
        if (!txt) return;
        ws.send(txt);
        const now = new Date().toLocaleTimeString();
        log.textContent += `[${now}] 你：${txt}\n`;
        input.value = "";
        log.scrollTop = log.scrollHeight;
      };
    </script>
  </body>
</html>
```

### 运行效果

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ab428c6f7a0c47d5bd66d007e734d6a8~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754972573&x-orig-sign=3MSZLqvAXuwLQ1G%2BhCQkrkbIbUo%3D)

---

## 小结

- **核心回顾**：

  - **握手**：由 HTTP 协议切换到 WebSocket；
  - **帧级通信**：高效、双向、实时；
  - **优雅挂断**：Close Frame 双向确认。

- **案例一**：公众号式单客户端定时推送；

- **案例二**：微信群聊式多人广播。

享受实时通信的快感，不再让你的应用“咕咕咕”地轮询！
