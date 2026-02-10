# CellStack - 工程师技术笔记

<center text-align="center" width="100%">
<img src="./public/logo.svg" width="100" height="100" alt="CellStack">
</center>

网址：[stack.mcell.top](https://stack.mcell.top)

计算机科学的工程实践和一些个人思考。

## 联系方式

- GitHub：[@minorcell](https://github.com/minorcell)
- 邮箱：minorcell6789@gmail.com
- 技术讨论：文章评论区

## MCP 集成（Issue #67）

- 构建时静态数据导出：
  - `pnpm run mcp:build-data`
  - 产物目录：`public/mcp/`
  - 资源类型：`blog`、`topic`、`topic_article`、`site_page`、`profile`
- 本地 MCP Server 包：
  - `packages/stack-mcp`
  - 包名：`@mcell/stack-mcp`
  - 本地运行：`npx -y @mcell/stack-mcp`
- 站点与作者信息统一数据源：
  - `content/site/site.json`
  - `content/site/me.json`

## License

MIT
