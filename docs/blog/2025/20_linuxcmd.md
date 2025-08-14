---
title: 从删库到跑路？这 50 个 Linux 命令能保你职业生涯
description: 精选 Linux 最实用的 50 个命令，从基础操作到系统管理，帮助开发者掌握命令行核心技能
date: 2025-01-20
tags:
  - Linux
  - 命令行
  - 系统管理
  - 运维
  - 开发工具
---

# 从删库到跑路？这 50 个 Linux 命令能保你职业生涯

> "我只想部署个服务，为啥要学命令行？"\
> 因为你迟早会遇到服务挂了，系统卡了，文件丢了，日志爆了。Linux 命令行就像程序员的宝葫芦，能查、能改、能救命。

这篇文章精选了 Linux 使用中**最常见最实用的 50 个命令**，不讲废话，只讲用法与思路。适用于刚接触 Linux 的开发者、运维工程师，或想转向后端/平台方向的前端同学。

---

### 基础命令：搞清楚你在哪，能干嘛

#### `ls` —— 列出目录内容

```bash
ls -l      # 以列表形式展示文件权限、大小、修改时间
ls -a      # 显示隐藏文件
```

#### `cd` / `pwd` —— 进入目录 & 显示当前路径

```bash
cd /demo  # 进入demo目录
pwd   # 查看当前位置
```

#### `mkdir` / `touch` —— 创建目录 & 空文件

```bash
mkdir test  # 创建文件夹test
touch test.go  # 创建一个空的test.go文件
```

#### `mv` / `cp` / `rm` —— 文件操作三兄弟（慎用 rm）

```bash
mv test.go url  # 把test.go移动到指定url下
cp config.yaml . # 拷贝config.yaml到当前牡蛎
rm -rf /tmp/test  # 小心别删错目录
```

---

### 搜索排查：找文件、找内容、找命令

#### `grep` —— 文本搜索神器

```bash
grep "error" app.log
```

#### `find` —— 文件查找器

```bash
find /etc -name "*.conf"
```

#### `history` —— 看你都敲过啥

```bash
history
```

#### `which` —— 命令在哪儿

```bash
which go
```

---

### 网络排障常用

#### `ping` / `curl` / `traceroute`

```bash
ping baidu.com
curl https://example.com
traceroute google.com
```

#### `ifconfig` / `ip a` —— 看你的 IP

```bash
ifconfig
# 或
ip a
```

#### `scp` / `ssh` —— 拷文件 / 远程登录

```bash
scp file.txt user@server:/tmp
ssh user@host
```

---

### 日志分析 + 调试技巧

#### `tail` / `less` / `head`

```bash
tail -f /var/log/nginx/access.log
less app.log
head -n 10 README.md
```

#### `ps` / `top` / `kill`

```bash
ps aux | grep nginx
top
kill -9 12345
```

---

### 权限 & 环境变量 & 脚本友好

#### `chmod` / `chown` / `sudo`

```bash
chmod +x deploy.sh
chown user:user file.txt
sudo systemctl restart nginx
```

#### `export` / `env`

```bash
export NODE_ENV=production
env | grep JAVA
```

#### `alias`

```bash
alias ll='ls -lAh'
```

---

### 文本处理：日志和数据处理神器

#### `awk` / `sed` / `cut` / `sort` / `uniq`

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -nr
sed -i 's/debug/info/' config.yaml
cut -d ':' -f1 /etc/passwd
```

---

### 文件压缩打包 & 系统信息

#### `tar` / `zip` / `unzip`

```bash
tar -czvf backup.tar.gz /var/www
unzip file.zip
```

#### `df` / `du` / `uptime` / `uname -a`

```bash
df -h          # 磁盘使用情况
du -sh *       # 当前目录下各项大小
uptime         # 系统运行时长
uname -a       # 内核信息
```

---

掌握这些命令不是让你变成“命令行大师”，而是为了**遇到问题时知道怎么下手解决**。你可以把这篇文章当作备忘录，出问题时直接搜索命令来用。

---
