# 从删库到跑路？这 50 个 Linux 命令能保你职业生涯

> “我只想部署个服务，为啥要学命令行？”\
> 因为你迟早会遇到服务挂了，系统卡了，文件丢了，日志爆了。Linux 命令行就像程序员的宝葫芦，能查、能改、能救命。

这篇文章精选了 Linux 使用中**最常见最实用的 50 个命令**，不讲废话，只讲用法与思路。适用于刚接触 Linux 的开发者、运维工程师，或想转向后端/平台方向的前端同学。

---

### 基础命令：搞清楚你在哪，能干嘛

#### `ls` —— 列出目录内容

```bash
ls -l      # 以列表形式展示文件权限、大小、修改时间
ls -a      # 显示隐藏文件
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/6162ca356c0c4a20ab9286e652ed14ee~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=snpmCucgKEyMc9PSNHPvI6Lfglk%3D)

#### `cd` / `pwd` —— 进入目录 & 显示当前路径

```bash
cd /demo  # 进入demo目录
pwd   # 查看当前位置
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/275e39ce7d7245d3be774920f7e0d0b2~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=XWFCPXsgNtJH72V2s88VDbBN80M%3D)

#### `mkdir` / `touch` —— 创建目录 & 空文件

```bash
mkdir test  # 创建文件夹test
touch test.go  # 创建一个空的test.go文件
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d16e25c690ff4c92add35875c58a39c6~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=GtMOcCJV1kNhDr7DhxxZMFR6Gyw%3D)

#### `mv` / `cp` / `rm` —— 文件操作三兄弟（慎用 rm）

```bash
mv test.go url  # 把test.go移动到指定url下
cp config.yaml . # 拷贝config.yaml到当前牡蛎
rm -rf /tmp/test  # 小心别删错目录
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/8c0242711bf742db9418dfb63c821707~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=AF%2BtWVE8L075yna2gJOovKmnFhQ%3D)

---

### 搜索排查：找文件、找内容、找命令

#### `grep` —— 文本搜索神器

```bash
grep "error" app.log
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/9894e70b37c7425a89fc151c898c3eed~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=WmIoTJV02kcwSxeZg2YtR0V%2BLbs%3D)

#### `find` —— 文件查找器

```bash
find /etc -name "*.conf"
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/5207cffc66504f1e994248888903abd9~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=eezBZtkRLtYcl3KlM1yb%2BuXdbmM%3D)

#### `history` —— 看你都敲过啥

```bash
history
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/e12175e4d6454b43ab5544b2ae414970~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=CHfuNIDo2R9R9RdH1uWHbFMkFDI%3D)

#### `which` —— 命令在哪儿

```bash
which go
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f608aff741b44f899a57557001edcef5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=m7tmQTalGNmvK6IZffZTU0StAWY%3D)

---

### 网络排障常用

#### `ping` / `curl` / `traceroute`

```bash
ping baidu.com
curl https://example.com
traceroute google.com
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/09731d2d289c43beb21488b64a8ef515~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=noHWgUlz2GDyiFvq19ddWCUorQs%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/149303e2cfac40ed922c8745a5205088~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=9j67FRKUQDGDzA%2BlGVzKI7NBhmg%3D)

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

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/140b46c5b84a4c8cb009a7b477790cec~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgbUNlbGw=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMjI4MDgyOTk2NzE0Njc3OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1754619502&x-orig-sign=tbg02fvDcoQzPcGcc5wB%2FAS60EE%3D)

---

掌握这些命令不是让你变成“命令行大师”，而是为了**遇到问题时知道怎么下手解决**。你可以把这篇文章当作备忘录，出问题时直接搜索命令来用。

---
