# 从 MD5 到 Bcrypt：密码哈希的演进与实践

在上一篇 [密码的本质与误解，先打好基础，扫除认知盲区](https://juejin.cn/post/7517542575495479348) 中，我们深入探讨了哈希与加密的区别，并着重解释了为什么“密码存储应使用不可逆的哈希算法”。也提到过，像 MD5、SHA-256 这样的快速哈希算法已经不再适用于密码存储。

那至于为什么这些算法不再安全？以及我们该如何选择更安全的哈希方案？这正是我们在这篇文章中想要讨论的内容；

---

### MD5

MD5 曾经是应用最广泛的哈希算法之一，因其计算速度快、哈希值固定长度而备受青睐。

在早期，很多开发者会这样使用 MD5 来存储密码。我们来看一个包风格的实现：

```go
// 使用MD5生成hash密码值
func GenerateMD5Hash(password string) string {
	hasher := md5.New()
	hasher.Write([]byte(password))
	return hex.EncodeToString(hasher.Sum(nil))
}
```

然后这样的使用：

```go
func main() {
	password := "123456"
	passwordHash := hash.GenerateMD5Hash(password)

	fmt.Printf("原密码: %s\n", password)
	fmt.Printf("MD5 Hash: %s\n", passwordHash)
	// 输出:
	// 原密码: 123456
	// MD5 Hash: 22fb95b7668615024765955685a73e5f
}
```

代码看似“加密”了密码，但正如我们之前所说，这只是一个哈希过程。而 **MD5 的致命弱点在于：**

1.  **速度过快**：现代计算机可以在一秒内计算数百万甚至数十亿次 MD5 哈希，如果没有做好防护策略，简单密码的暴力破解也只是时间问题。
1.  **彩虹表攻击** ：由于 MD5 计算速度快且缺乏内置的随机性，黑客们可以预先计算大量常用密码的 MD5 哈希值，并将其存储在一个巨大的映射表中。当他们获取到泄露的 MD5 哈希值时，可以直接在彩虹表中查找对应的明文密码，实现快速“逆推”。这就像一本巨大的“字典”。

---

### “盐”的登场

为了应对彩虹表攻击， **“盐”** 的概念应运而生。盐是一个随机生成的字符串，它会与用户的密码拼接在一起，然后再进行哈希值计算。

```go
// 根据设定长度生成随机盐
func generateSalt(length int) string {
	const charset = "abcdefghij..."
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
            b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

// 根据随机盐和原始密码，经过md5之后生成hash密码
func GenerateMD5HashWithSalt(password string) (string, string) {
	salt := generateSalt(16)
	passwordWithSalt := password + salt

	hasher := md5.New()
	hasher.Write([]byte(passwordWithSalt))
	passwordHash := hex.EncodeToString(hasher.Sum(nil))

	return passwordHash, salt
}

// 校验，传入原始数据、存储的hash和盐
func VerifyMD5HashWithSalt(password, storedHash, storedSalt string) bool {
	passwordWithSalt := password + storedSalt
	hasher := md5.New()
	hasher.Write([]byte(passwordWithSalt))
	computedHash := hex.EncodeToString(hasher.Sum(nil))
	return computedHash == storedHash
}
```

它的使用姿势大致如下：

```go
func main() {
	password := "123456"

	// 生成带盐的MD5哈希
	passwordHash, salt := hash.GenerateMD5HashWithSalt(password)

	fmt.Printf("原始数据: %s\n", password)
	fmt.Printf("随机盐: %s\n", salt)
	fmt.Printf("MD5 Hash with Salt: %s\n", passwordHash)
	// 输出什么取决于随机盐；

	// 验证密码
	inputPassword := "123456"
	if hash.VerifyMD5HashWithSalt(inputPassword, passwordHash, salt) {
		fmt.Println("密码正确，登陆成功；")
	} else {
		fmt.Println("密码错误；")
	}
}
```

加入了盐之后，彩虹表就失效了。因为即使两个用户设置了相同的密码，由于盐是随机的，它们的最终哈希值也会完全不同。黑客们需要为每一个可能的密码和每一个可能的盐组合预先计算哈希值，这在计算量上是不可行的。

然而，**MD5 + Salt 并非万无一失**。它依然存在问题：

1.  **仍然是 MD5**：即使加了盐，底层的 MD5 算法本身还是**计算速度非常快**。这意味着攻击者虽然不能用彩虹表，但仍然可以对单个用户的密码进行**暴力破解**。如果攻击者知道某个用户的盐和哈希值，他们可以尝试各种可能的密码，并将它们与已知的盐组合进行 MD5 哈希，直到找到匹配项（虽然时间上不太可能）。
1.  **盐的存储问题**：为了在验证密码时能够重新生成哈希值进行比对，**盐必须和哈希值一起存储**在数据库中。这无疑增加了管理的复杂性（笔者认为的主要问题，还是数据库的泄漏）。

所以，MD5 + Salt 虽然比纯 MD5 有进步，但在面对日益强大的计算能力时，它依然脆弱。我们需要一种更“慢”的哈希算法。

---

### Bcrypt

这就是 **Bcrypt** 登场的原因。Bcrypt 是一种专门为密码存储而设计的哈希算法，主要就是它解决了 MD5 + Salt 的核心痛点：

1.  **内置随机盐**：Bcrypt 自动为每个密码生成一个唯一的随机盐，并将其嵌入到最终的哈希值中。所以，我们不再需要手动存储和管理盐。
1.  **计算慢且可调节**：Bcrypt 最大的特点是其“**成本因子**”，也可以叫工作因子或迭代次数。我们可以通过调整这个因子来控制哈希计算的耗时。计算越慢，暴力破解的成本就越高。随着计算机性能的提升，我们可以简单地增加成本因子来提高安全性，而无需更换算法。

在 Go 语言中，使用 Bcrypt 非常简单，通常通过 `golang.org/x/crypto/bcrypt` 包实现：

```go
// 使用Bcrypt生成hash密码值；
// 注意，和上面md5+salt不同的是，这里添加了cost；
func GenerateBcryptHash(password string, cost int) (string, error) {
	if cost == 0 {
		cost = bcrypt.DefaultCost
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	if err != nil {
		return "", fmt.Errorf("生成错误: %w", err)
	}
	return string(hashedPassword), nil
}

// 校验，不需要传入salt等，因为自带；
func VerifyBcryptHash(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
```

这样的使用姿势：

```go
func main() {
	password := "123456"

	// 生成密码哈希，使用默认成本因子
	hashedPassword, err := hash.GenerateBcryptHash(password, bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("生成错误: %v", err)
	}

	fmt.Printf("Original Password: %s\n", password)
	fmt.Printf("Bcrypt Hash: %s\n", hashedPassword)

	// 验证密码
	inputPassword := "123456" // 用户登录时输入的密码
	err = hash.VerifyBcryptHash(hashedPassword, inputPassword)
	if err != nil {
		fmt.Println("密码错误，", err)
	} else {
		fmt.Println("密码正确，登陆成功；")
	}
}
```

注意 Bcrypt 哈希值的格式，例如 `$2a$10$Q...`。它包含了算法版本（`2a`）、成本因子（`10`）以及最重要的**盐值和最终的哈希值**。就是说 Bcrypt 哈希值本身就包含了验证所需的所有信息，我们不用像 md5 那样单独存一份盐；

---

从 MD5 到 Bcrypt，我们看到了选择正确的哈希算法是构建安全密码体系的第一步，也是最重要的一步。在下一篇中，我们将聚焦于密码校验和攻击面，从安全攻防的角度，探讨如何识别和防御常见的密码相关漏洞。
