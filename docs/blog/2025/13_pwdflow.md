---
title: 密码校验与攻击面：不再"裸奔"的防线
description: 从安全攻防角度深入探讨密码校验的常见误区和潜在攻击面，构建全面的防护体系
date: 2025-01-27
tags: 
  - 密码安全
  - 攻击防护
  - 前端安全
  - 后端安全
  - SQL注入
---

# 密码校验与攻击面：不再"裸奔"的防线

[前面](https://juejin.cn/post/7517501712573693978) 我们已经搞清楚了密码哈希，从最初的的 MD5 进化到了健壮的 Bcrypt。密码被安全地存储起来，是不是就高枕无忧了？远没有那么简单。

密码，从用户输入到最终验证，中间的每一个环节都可能成为攻击者利用的突破口。这次，我们将从**安全攻防**的角度，聚焦于**密码校验**的常见误区和潜在的**攻击面**，并结合前端的防护，看看我们能做些什么。

---

### 前端校验

很多开发者习惯在前端进行密码强度校验，比如判断密码长度、是否包含大小写字母、数字和特殊字符。这固然是好事，能**提升用户体验**（及时反馈）和**减轻服务器压力**（减少无效请求）。

```JavaScript
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return "密码长度至少需要8位";
    }
    if (!hasUpperCase) {
        return "密码需要包含大写字母";
    }
    if (!hasLowerCase) {
        return "密码需要包含小写字母";
    }
    if (!hasDigit) {
        return "密码需要包含数字";
    }
    if (!hasSpecialChar) {
        return "密码需要包含特殊字符";
    }
    return ""; // 空字符串表示校验通过
}

// 在用户注册或修改密码时调用
const userPassword = document.getElementById('passwordInput').value;
const error = validatePassword(userPassword);
if (error) {
    alert(error); // 提示用户错误信息
} else {
    // 提交到后端
}
```

**然而，前端校验只是用户角度的表面协定！** 稍微懂些技术手段的攻击者可以轻易绕过前端的 JavaScript 校验，直接构造 `curl` 请求发送到后端。所以，**所有前端的校验，都必须在后端重新执行一遍**。

**所以说，安全校验的核心始终在后端。**

---

### 常见的密码攻击面与后端防御

既然后端是主战场，那我们来看看有哪些常见的攻击，以及如何加固我们的防线。

#### 1. 暴力破解

攻击者通过不断尝试不同的密码组合来猜测用户密码。这是最简单粗暴，但也非常有效的攻击手段。

- **攻击原理**：自动化工具持续向登录接口发送请求，尝试所有可能的密码。

- **防御策略**：

  - **限制尝试次数**：对特定用户或 IP 地址限制在单位时间内的登录尝试次数。例如，**GitHub**、**银行 APP**等在密码输错几次后会要求输入验证码或锁定账户一段时间。

  - **验证码** ：在多次失败尝试后，引入图形验证码、短信验证码等，增加自动化破解的难度。

  - **延时响应**：故意增加每次登录失败的响应时间，例如延时 1-2 秒，显著提高攻击成本。

    ```go
    // 伪代码：登录失败时延时
    func LoginHandler(w http.ResponseWriter, r *http.Request) {
        // ... 解析用户名和密码 ...
        if !validateCredentials(username, password) {
            time.Sleep(2 * time.Second) // 故意延时
            http.Error(w, "Invalid credentials", http.StatusUnauthorized)
            return
        }
        // ... 登录成功 ...
    }
    ```

  - **IP 黑名单/速率限制**：识别并封禁短时间内异常请求的 IP 地址。

    ```go
    // 伪代码：基于 IP 的速率限制与黑名单
    // 假设我们有一个全局的 map 来存储 IP 的失败尝试次数和封禁时间
    var ipAttempts = make(map[string]int)
    var ipBlockedUntil = make(map[string]time.Time)
    const MAX_ATTEMPTS = 5
    const BLOCK_DURATION = 15 * time.Minute

    func LoginHandler(w http.ResponseWriter, r *http.Request) {
        ip := r.RemoteAddr // 获取请求 IP

        // 检查 IP 是否被封禁
        if blockedUntil, ok := ipBlockedUntil[ip]; ok && time.Now().Before(blockedUntil) {
            http.Error(w, "Too many failed attempts. Please try again later.", http.StatusTooManyRequests)
            return
        }

        // ... 解析用户名和密码 ...
        if !validateCredentials(username, password) {
            // 登录失败，增加尝试次数
            ipAttempts[ip]++
            if ipAttempts[ip] >= MAX_ATTEMPTS {
                ipBlockedUntil[ip] = time.Now().Add(BLOCK_DURATION)
                delete(ipAttempts, ip) // 清除尝试次数，等待解封
                log.Printf("IP %s blocked for %v due to too many failed login attempts.", ip, BLOCK_DURATION)
            }
            time.Sleep(2 * time.Second) // 延时响应
            http.Error(w, "Invalid credentials", http.StatusUnauthorized)
            return
        }

        // 登录成功，清除该 IP 的尝试次数和封禁状态
        delete(ipAttempts, ip)
        delete(ipBlockedUntil, ip)
        // ... 登录成功处理 ...
    }
    ```

#### 2. 撞库攻击

攻击者利用在其他网站泄露的"用户名-密码"组合，来尝试登录你的网站。由于很多用户习惯在不同网站使用相同的密码，这种攻击成功率事实上是很高的。

- **攻击原理**：如果你的用户在 A 网站的账号密码是 `mcell@juejin.com`/`P@ssword123`，而 A 网站数据泄露了，攻击者就会用这套凭证尝试登录你的网站，甚至是你服务下的其他关联网站（比如支付宝撞淘宝、QQ 撞微信等）。

- **防御策略**：

  - **异地登录提醒**：当检测到用户在不常见地点或设备登录时，发送邮箱或者短信提醒通知。**微信**、**支付宝**等都有此功能。

  - **二次认证** ：对于高风险操作或登录，强制要求用户进行短信验证码、TOTP（如 Google Authenticator）或硬件密钥等多因素认证。这是对抗撞库最有效的手段之一。**Google**、**GitHub** 等平台广泛使用。

  - **密码泄露检测**：主动监控公开的密码泄露数据库（如 Have I Been Pwned），通知用户其密码可能已泄露，并引导其修改密码。

    ```go
    // 伪代码：简单地检查密码是否在黑名单中
    func IsPasswordLeaked(password string) bool {
        // 实际应用中会查询一个专业的泄露密码数据库
        leakedPasswords := map[string]bool{
            "123456": true,
            "password": true,
            "admin123": true,
            // ... 更多泄露密码哈希或模式 ...
        }
        // 实际这里可能对比的是哈希值，防止明文泄露
        return leakedPasswords[password]
    }

    func RegisterHandler(w http.ResponseWriter, r *http.Request) {
        // ... 获取密码 ...
        if IsPasswordLeaked(password) {
            http.Error(w, "您的密码已泄露，请使用更安全的密码", http.StatusBadRequest)
            return
        }
        // ... 正常注册流程 ...
    }
    ```

#### 3. SQL 注入

如果你的后端代码在处理用户输入的用户名和密码时，没有进行严格的参数化查询或输入过滤，攻击者可以构造恶意字符串，绕过登录验证，甚至控制数据库。

- **攻击原理**：

  ```sql
  -- 攻击者输入：' OR '1'='1 --
  SELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = '...'
  ```

  这条 SQL 语句会绕过密码校验，直接登录。

- **防御策略**：

  - **参数化查询/预编译语句**：**这是防御 SQL 注入的黄金法则。** 永远不要直接拼接用户输入到 SQL 语句中。使用数据库驱动提供的参数绑定功能或者 ORM（比如 GORM）。

    ```go
    // 伪代码：使用参数化查询
    func GetUserByCredentials(db *sql.DB, username, password string) (*User, error) {
        // 假设 dbUser 是从数据库查到的用户记录，dbHash 是存储的密码哈希
        row := db.QueryRow("SELECT id, username, password_hash FROM users WHERE username = ?", username)
        var id int
        var dbUsername, dbHash string
        err := row.Scan(&id, &dbUsername, &dbHash)
        if err != nil {
            if err == sql.ErrNoRows {
                return nil, fmt.Errorf("user not found")
            }
            return nil, fmt.Errorf("database error: %w", err)
        }

        // 使用 bcrypt 验证密码
        if err := bcrypt.CompareHashAndPassword([]byte(dbHash), []byte(password)); err != nil {
            return nil, fmt.Errorf("invalid password")
        }
        return &User{ID: id, Username: dbUsername}, nil
    }
    ```

  - **输入验证与过滤**：虽然参数化查询是主要手段，但对输入进行长度、字符类型等验证仍然是良好的实践。

#### 4. 弱密码策略

这就很简单了，比如系统允许用户设置过于简单、容易猜测的密码（如`123456`、`password`）。

- **攻击原理**：攻击者可以直接用字典中最常见的密码尝试，命中率很高。

- **防御策略**：

  - **强制密码复杂度**：要求密码长度（至少 8-12 位）、大小写字母、数字、特殊字符的组合。**几乎所有主流网站**在注册时都会强制要求。

  - **禁止常见弱密码**：维护一个常见弱密码或被泄露密码的黑名单，用户注册或修改密码时进行校验。

    ```go
    // 伪代码：后端密码强度校验
    func ValidatePasswordStrength(password string) error {
        if len(password) < 8 {
            return fmt.Errorf("密码长度至少需要8位")
        }
        // 更多的正则匹配来检查大小写、数字、特殊字符
        if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
            return fmt.Errorf("密码需要包含大写字母")
        }
        // ... 其他校验 ...

        // 检查是否为常见弱密码（通常比前端的列表更全，甚至与Have I Been Pwned等服务结合）
        if isCommonWeakPassword(password) { // 假设有这个函数
            return fmt.Errorf("请勿使用过于常见的弱密码")
        }
        return nil
    }
    ```

---

### 安全，是系统性的工程

从前端的初步校验到后端的层层防御，再到多因素认证的引入，我们可以看到密码安全是一个涉及多个环节的**系统性工程**。它不仅仅是后端几行代码的问题，更是需要：

- **全面的安全意识**：开发者需要理解各种攻击原理。
- **严谨的编码实践**：始终遵循安全最佳实践，如参数化查询。
- **用户教育**：引导用户设置强密码，并理解多因素认证的重要性。
- **持续的监控与审计**：及时发现和响应异常行为。

读到这里，你有没有重新审视自己项目中的密码管理机制？在你的实际开发经历中，哪种密码攻击让你印象最深刻？又是如何应对的呢？期待你在评论区分享你的经验和思考。