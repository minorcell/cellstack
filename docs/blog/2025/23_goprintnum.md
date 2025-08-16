# Go 并发定时任务避坑指南：从 Sleep 到 Context 的 8 种写法全解析

> 本文从 0 开始，带你用一个超简单的任务（每秒打印一个数字）学会：
>
> - Go `time` 包的几种定时 API
> - `goroutine`、`WaitGroup`、`channel`、`select`、`context` 的用法
> - 哪些并发写法是坑，哪些是生产推荐
> - 完整可运行的 `main.go`

---

## 背景

任务：每秒打印一个数字，连续 10 次。

**隐含要求**：

- 间隔稳定（大约 1 秒）
- 顺序正确（1 → 10）
- 最好可以提前取消

**为什么这个任务重要？**  
这个简单任务涵盖了并发编程的核心要素：**定时控制**、**顺序保证**和**生命周期管理**。掌握它，你就掌握了 Go 并发的基础！

---

## 1. 基础写法：`time.Sleep`

```go
func UseTimeSleep() {
    for i := 1; i <= 10; i++ {
        // 暂停当前goroutine的执行1秒钟
        // time.Second是预定义的Duration常量，等于1,000,000,000纳秒
        time.Sleep(time.Second)

        // 打印当前数字
        fmt.Println(i)
    }
}
```

**关键 API 详解**：

- `time.Sleep(d Duration)`：暂停当前 goroutine 的执行至少 d 时长
- `time.Second`：预定义的 Duration 常量，表示 1 秒（1e9 纳秒）
- `fmt.Println`：标准输出函数，线程安全

**优点**：

- 顺序正确
- 最简单易懂

**缺点**：

- 无法中途取消
- 实际间隔 = 1 秒 + 打印耗时，会有累积误差
- 阻塞当前 goroutine，无法同时执行其他任务

**适用场景**：简单脚本、不需要取消功能的短期任务

---

## 2. `time.After`：一次定时一次信号

```go
func UseTimeAfter() {
    for i := 1; i <= 10; i++ {
        // time.After返回一个单向接收通道(<-chan Time)
        // 该通道会在指定时间后发送一个时间值
        timerChannel := time.After(time.Second)

        // <-操作符会阻塞，直到通道发送值
        <-timerChannel

        fmt.Println(i)
    }
}
```

**关键点解析**：

- `time.After(d Duration) <-chan Time`：返回一个**只接收通道**
- 通道操作`<-ch`是**阻塞操作**，直到有数据可读
- 每次循环都创建新 Timer 对象，有 GC 压力

**潜在问题**：

- 频繁创建 Timer 对象，可能引起 GC 压力
- 无法复用定时器
- 同样无法取消

**适用场景**：单次超时控制，如网络请求超时

---

## 3. `time.NewTicker`：复用定时器

```go
func UseTimeTicker() {
    // 创建Ticker对象，每1秒向C通道发送当前时间
    ticker := time.NewTicker(time.Second)

    // defer确保函数退出时停止Ticker，释放资源
    defer ticker.Stop()

    for i := 1; i <= 10; i++ {
        // 从Ticker的C通道读取值（阻塞直到时间到）
        <-ticker.C

        fmt.Println(i)
    }
}
```

**Ticker 对象解析**：

- `time.NewTicker(d Duration) *Ticker`：创建周期性定时器
- `ticker.C <-chan Time`：定时触发的通道
- `ticker.Stop()`：停止定时器，**必须调用**否则资源泄漏

**优点**：

- 单一定时器复用，高效
- 间隔精确

**注意事项**：

- 忘记 Stop()会导致 goroutine 泄漏
- 使用后应立即 defer Stop()

**适用场景**：周期性任务，如定时数据采集

---

## 4. 并发误区

### 4.1 `channel` 并发版（顺序混乱）

```go
func UseChannel() {
    // 创建无缓冲通道，发送和接收会同步阻塞
    ch := make(chan int)

    for i := 1; i <= 10; i++ {
        // 启动goroutine（轻量级线程）
        go func(num int) {
            // 每个goroutine等待不同时间
            time.Sleep(time.Second * time.Duration(num))

            // 向通道发送数字
            ch <- num
        }(i) // 注意：必须传入i的副本，避免闭包捕获问题
    }

    for i := 1; i <= 10; i++ {
        // 从通道接收值（阻塞直到有数据）
        value := <-ch
        fmt.Println(value)
    }
}
```

**执行顺序解析**：

![016.png](/images/2025/016.png)

**问题分析**：

- 10 个 goroutine 并发执行，完成顺序不确定
- 通道接收顺序 = goroutine 完成顺序 ≠ 数字顺序
- 间隔时间不固定（1 秒到 10 秒）

**正确使用场景**：独立任务并行处理，如批量图片处理

---

### 4.2 `WaitGroup` 并发版（顺序混乱）

```go
func UseGoroutine() {
    // 创建WaitGroup用于等待所有goroutine完成
    var wg sync.WaitGroup

    for i := 1; i <= 10; i++ {
        // 增加等待计数
        wg.Add(1)

        go func(num int) {
            // 函数退出时减少计数
            defer wg.Done()

            time.Sleep(time.Second * time.Duration(num))
            fmt.Println(num)
        }(i)
    }

    // 阻塞直到所有goroutine完成
    wg.Wait()
}
```

**WaitGroup 原理**：

- `Add(delta int)`：增加等待计数
- `Done()`：减少计数（等价于 Add(-1)）
- `Wait()`：阻塞直到计数归零

**问题分析**：

- 输出顺序完全随机
- 间隔时间不固定
- 多个 goroutine 同时调用 fmt.Println 可能输出交错

**适用场景**：并行执行独立任务，不需要顺序保证

---

## 5. 正确的并发写法

### 5.1 单 goroutine + WaitGroup

```go
func UseSingleGoroutine() {
    var wg sync.WaitGroup

    // 只需等待1个goroutine
    wg.Add(1)

    // 启动工作goroutine
    go func() {
        // 确保结束时通知WaitGroup
        defer wg.Done()

        for i := 1; i <= 10; i++ {
            fmt.Println(i)
            time.Sleep(time.Second)
        }
    }()

    // 主goroutine等待工作完成
    wg.Wait()
}
```

**架构解析**：

```
主goroutine         工作goroutine
    │                    │
    │── wg.Add(1) ────>▶│
    │                    │
    │                    ├─ 执行循环
    │                    │   打印+等待
    │                    │
    │◀─── wg.Wait() ─────┤
    ▼                    ▼
```

**优点**：

- 顺序和间隔完全可控
- 结构清晰
- 为添加取消功能留出空间

**适用场景**：需要顺序执行的定时任务

---

### 5.2 `select` + `Ticker`

```go
func UseSelectAndTicker() {
    ticker := time.NewTicker(time.Second)
    defer ticker.Stop()

    for i := 1; i <= 10; i++ {
        // select监控多个通道操作
        select {
        // 当ticker.C有值时执行
        case <-ticker.C:
            fmt.Println(i)
        }
    }
}
```

**select 关键字详解**：

- 用于监听多个通道操作
- 当任意 case 可执行时，随机选择一个执行
- 无 default 时会阻塞
- 常用于多路复用

**进阶用法**（添加退出通道）：

```go
quit := make(chan struct{})
// ...
select {
case <-ticker.C:
    fmt.Println(i)
case <-quit:
    fmt.Println("提前退出")
    return
}
```

**适用场景**：需要监控多个事件源的定时任务

---

### 5.3 `context` + `Ticker`（生产推荐）

```go
func UseContextWithTicker() {
    // 创建可取消的context
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel() // 确保资源释放

    ticker := time.NewTicker(time.Second)
    defer ticker.Stop() // 确保停止ticker

    i := 1
    for {
        select {
        case <-ticker.C: // 定时触发
            fmt.Println(i)
            i++
            if i > 10 {
                return // 自然结束
            }

        case <-ctx.Done(): // 上下文取消
            fmt.Println("任务取消:", ctx.Err())
            return
        }
    }
}
```

**context 包深度解析**：

![017.png](/images/2025/017.png)

**核心优势**：

1. **取消传播**：一次取消，所有监听组件都能收到通知
2. **超时控制**：可添加 WithTimeout 自动取消
3. **资源安全**：defer 确保资源释放
4. **标准统一**：Go 标准库广泛使用

**实际应用**：

```go
// 带超时的context
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

// 在数据库查询中使用
err := db.QueryContext(ctx, "SELECT...")
```

**适用场景**：所有生产环境需要生命周期管理的并发任务

---

## 6. 方法对比

| 方案            | 顺序 | 间隔 | 可取消 | 资源回收 | 复杂度   | 适用场景                   |
| --------------- | ---- | ---- | ------ | -------- | -------- | -------------------------- |
| Sleep           | ✅   | 一般 | ❌     | ✅       | ⭐       | 简单脚本                   |
| After           | ✅   | ✅   | ❌     | ✅       | ⭐       | 单次超时                   |
| Ticker          | ✅   | ✅   | ❌     | ✅       | ⭐⭐     | 周期性任务                 |
| Channel 并发    | ❌   | ❌   | ❌     | ✅       | ⭐⭐⭐   | 并行独立任务（不要求顺序） |
| WaitGroup 并发  | ❌   | ❌   | ❌     | ✅       | ⭐⭐     | 并行独立任务（简单同步）   |
| 单 goroutine+WG | ✅   | ✅   | ❌     | ✅       | ⭐⭐     | 顺序定时任务               |
| select+Ticker   | ✅   | ✅   | ⚠️\*   | ✅       | ⭐⭐⭐   | 多事件源监控               |
| context+Ticker  | ✅   | ✅   | ✅     | ✅       | ⭐⭐⭐⭐ | **生产级定时任务（推荐）** |

> 需自行实现取消通道

---

## 7. 完整可运行示例

```go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

// 所有实现函数（前面已详细解释）

func main() {
    fmt.Println("=== 基础: time.Sleep ===")
    UseTimeSleep()

    fmt.Println("\n=== 基础: time.After ===")
    UseTimeAfter()

    fmt.Println("\n=== 基础: time.Ticker ===")
    UseTimeTicker()

    fmt.Println("\n=== 误区: Channel并发 ===")
    UseChannel()

    fmt.Println("\n=== 误区: WaitGroup并发 ===")
    UseGoroutine()

    fmt.Println("\n=== 正确: 单goroutine+WaitGroup ===")
    UseSingleGoroutine()

    fmt.Println("\n=== 正确: select+Ticker ===")
    UseSelectAndTicker()

    fmt.Println("\n=== 生产推荐: context+Ticker ===")
    UseContextWithTicker()

    fmt.Println("\n=== 所有示例执行完成 ===")
}
```

**运行方式**：

```bash
# 运行程序
go run main.go

# 输出示例：
=== 基础: time.Sleep ===
1
2
...
10

=== 误区: Channel并发 ===
1
3
2
... # 顺序随机
```

---

## 进阶学习建议

1. **context 的更多用法**：

   - `context.WithTimeout`：自动超时取消
   - `context.WithValue`：传递请求范围数据
   - 上下文传递规范

2. **错误处理模式**：

   ```go
   select {
   case <-ctx.Done():
       return ctx.Err()
   case err := <-errCh:
       return err
   }
   ```

3. **资源管理最佳实践**：

   - 总是 defer 关闭资源
   - 使用`sync.Once`确保单次初始化
   - 避免在循环中创建 goroutine

4. **性能调优**：
   - 使用`pprof`分析 goroutine 泄漏
   - 合理设置 GOMAXPROCS
   - 避免过度并发

> 实际项目中的并发往往更复杂，但核心原理不变。掌握这些基础模式，你就能构建健壮的并发系统！
