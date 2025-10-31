# 多平台自动发布使用指南

## 概述

CellStack 支持将博客文章自动同步到各大技术平台，包括掘金、CSDN等。本文档介绍如何使用此功能。

## 功能特性

✅ **已实现平台**
- 掘金 (juejin.cn)

🚀 **即将支持**
- CSDN
- 开源中国
- 思否

## 快速开始

### 1. 配置平台访问令牌

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加以下密钥：

```
JUEJIN_TOKEN=你的掘金访问令牌
```

### 2. 获取掘金访问令牌

1. 登录 [掘金开放平台](https://juejin.cn/open)
2. 创建应用并获取访问令牌
3. 将令牌配置到 GitHub Secrets

### 3. 手动同步

```bash
# 安装依赖（首次使用）
npm install

# 同步到掘金平台
npm run sync:juejin

# 预览模式（不实际发布）
npm run sync:juejin -- --dry-run

# 强制重新同步所有文章
npm run sync:juejin -- --force
```

### 4. CI/CD 自动同步

推送到 `main` 分支时，会自动执行：
1. 构建 VitePress 网站
2. 部署到 GitHub Pages
3. 同步文章到掘金平台

## 同步脚本使用

### 命令行选项

```bash
node scripts/sync/index.js <platform> [options]

# 参数
platform    指定平台 (juejin | all)
--dry-run   预览模式，不实际发布
--force     强制重新同步
--debug     调试模式，输出详细日志
```

### 使用示例

```bash
# 仅同步掘金平台
node scripts/sync/index.js juejin

# 预览掘金同步（推荐先运行此命令）
node scripts/sync/index.js juejin --dry-run

# 强制同步所有文章到掘金
node scripts/sync/index.js juejin --force

# 调试模式
node scripts/sync/index.js juejin --debug
```

## 文章同步标记

在文章头部frontmatter中，可以添加同步标记：

```yaml
---
title: 文章标题
description: 文章描述
author: mcell
tags: [标签1, 标签2]
published_platforms:
  juejin: true
---
```

## 同步状态管理

同步状态保存在 `.sync-state.json` 文件中，包含：
- 已发布的文章
- 发布失败的记录
- 发布链接和文章ID

查看同步状态：
```bash
# 预览同步将显示状态概览
npm run sync:juejin --dry-run
```

## 平台配置

### 掘金平台

掘金平台自动检测文章分类和标签：

**分类映射：**
- AI工程 → `6809637767543217160`
- 系统运维 → `6809637767543217185`
- 后端 → `6809637767543217155`
- 安全与网络 → `6809637767543217193`
- 前端开发 → `6809637767543217166`

**标签自动映射：**
系统会根据文章标签自动映射到掘金的标签ID。

**图片处理：**
- 自动将图片URL转换为CDN链接
- 提取第一张图片作为封面

## 故障排除

### 常见问题

**Q: 同步失败，提示访问令牌无效**
A: 检查 `JUEJIN_TOKEN` 是否正确配置，或者令牌是否过期

**Q: 文章已发布但状态未更新**
A: 查看 `.sync-state.json` 文件，或运行 `npm run sync:juejin --dry-run`

**Q: 图片显示异常**
A: 确保图片已上传到CDN，链接格式为 `https://stack-mcell.tos-cn-shanghai.volces.com/`

### 调试

启用调试模式：
```bash
npm run sync:juejin --debug
```

查看详细日志，包括：
- API请求和响应
- 状态文件操作
- 文章解析结果
- 格式转换过程

## 开发指南

### 代码结构

```
scripts/sync/
├── index.js              # 主入口
├── config/
│   └── sync.config.js    # 同步配置
├── platforms/
│   └── juejin.js         # 掘金API
└── utils/
    ├── parser.js         # 文章解析
    ├── converter.js      # 格式转换
    ├── state.js          # 状态管理
    └── logger.js         # 日志工具
```

### 添加新平台

1. 在 `platforms/` 目录下创建新的平台客户端
2. 在 `config/sync.config.js` 中添加平台配置
3. 在 `index.js` 中添加同步逻辑

### 配置说明

**全局配置** (`config/sync.config.js`)
- `siteUrl`: 站点基础URL
- `imageBaseUrl`: 图片CDN地址
- `retry`: 重试配置
- `concurrency`: 并发控制

**掘金配置**
- `categories`: 分类ID映射
- `tagMapping`: 标签ID映射
- `apiUrl`: API地址

## 最佳实践

1. **预览优先**：首次发布前务必使用 `--dry-run` 预览
2. **逐步测试**：先测试少量文章，确认无误后批量同步
3. **定期检查**：查看 `.sync-state.json` 了解同步状态
4. **备份数据**：定期备份状态文件和原始文章
5. **监控日志**：关注GitHub Actions的运行日志

## 贡献指南

欢迎提交 Issue 和 PR！

### 开发环境

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 调试模式
node scripts/sync/index.js juejin --debug --dry-run
```

### 提交规范

- feat: 新功能
- fix: 修复
- docs: 文档更新
- refactor: 重构
- test: 测试

## 许可证

MIT License

## 支持

如有问题，请在 GitHub 提交 Issue。

---

*最后更新：2025-10-31*
