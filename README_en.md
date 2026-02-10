# CellStack - Engineer's Technical Notes

<center text-align="center" width="100%">  
<img src="./public/logo.svg" width="100" height="100" alt="CellStack">  
</center>  

Website: [stack.mcell.top](https://stack.mcell.top)  

Engineering practices in computer science and some personal thoughts.  

## Contact  

- GitHub: [@minorcell](https://github.com/minorcell)  
- Email: minorcell6789@gmail.com  
- Technical discussions: Comment sections of posts  

## MCP Integration (Issue #67)

- Build-time static dataset:
  - `pnpm run mcp:build-data`
  - Output: `public/mcp/`
  - Resource types: `blog`, `topic`, `topic_article`, `site_page`, `profile`
- Local MCP server package:
  - `packages/stack-mcp`
  - Package name: `@mcell/stack-mcp`
  - Run locally: `npx -y @mcell/stack-mcp`
- Unified source for site/profile data:
  - `content/site/site.json`
  - `content/site/me.json`

## License  

MIT
