# @mcell/stack-mcp

A local MCP server that reads multi-resource static datasets (blog posts, topics, topic articles, site pages).

## Usage

```bash
npx -y @mcell/stack-mcp
```

By default it reads index data from:

`https://stack.mcell.top/mcp/index.json`

## Configure in MCP clients (example)

```json
{
  "mcpServers": {
    "cellstack": {
      "command": "npx",
      "args": ["-y", "@mcell/stack-mcp"]
    }
  }
}
```

The defaults are already built in:

- `STACK_MCP_INDEX_URL=https://stack.mcell.top/mcp/index.json`
- `STACK_MCP_CACHE_DIR=~/.cache/stack-mcp`

## Tools

- `read_last`: Latest content entries (`blog` + `topic_article` by default).
- `read_latest`: Alias of `read_last`.
- `list_resources`: General list/search tool across all resource types.
- `list_topics`: Topic overview list.
- `read_resource`: Read one resource by `id` or `slug`.
- `search_articles`: Compatibility alias for content search.
- `read_article`: Compatibility alias for `read_resource`.
- `refresh_index`: Force refresh remote index cache.

## Environment Variables

- `STACK_MCP_INDEX_URL`: Static index JSON URL.
- `STACK_MCP_CACHE_DIR`: Local cache directory. Default: `~/.cache/stack-mcp`.
- `STACK_MCP_CACHE_TTL_SECONDS`: Cache TTL (seconds). Default: `1800`.
- `STACK_MCP_REQUEST_TIMEOUT_SECONDS`: HTTP timeout (seconds). Default: `20`.
- `STACK_MCP_DEBUG`: Optional debug log switch (`1`/`true`/`yes` to enable).

## Static Data Format

`index.json`:

```json
{
  "version": 2,
  "generatedAt": "2026-02-10T00:00:00.000Z",
  "stats": {
    "blog": 10,
    "topic": 3,
    "topic_article": 30,
    "site_page": 1
  },
  "entries": [
    {
      "id": "blog:2026/example",
      "type": "blog",
      "slug": "2026/example",
      "title": "Example",
      "description": "Example summary",
      "url": "/blog/2026/example",
      "document": "articles/blog_2026_example.json",
      "extra": {
        "section": "blog",
        "contentFormat": "markdown"
      }
    }
  ]
}
```

Document JSON:

```json
{
  "id": "blog:2026/example",
  "type": "blog",
  "slug": "2026/example",
  "title": "Example",
  "url": "/blog/2026/example",
  "document": "articles/blog_2026_example.json",
  "sourcePath": "content/blog/2026/example.md",
  "metadata": {},
  "content": "markdown body",
  "extra": {}
}
```

Other generated files:

- `latest.json`: precomputed latest content entries.
- `catalog.json`: ids grouped by type plus `contentIds`.

## Build Data in This Repository

The site repository generates static data during build:

```bash
pnpm run mcp:build-data
```

Generated files are written to `public/mcp/`.
