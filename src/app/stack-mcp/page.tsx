import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MCP Server Page',
  description: 'CellStack MCP Server 接入方式与快速配置示例',
}

const guides = [
  {
    title: 'Codex CLI',
    subtitle: '推荐，直接通过 codex 命令行添加',
    snippet: 'codex mcp add cellstack -- npx -y @mcell/stack-mcp',
  },
  {
    title: 'Claude Code',
    subtitle: 'CLI 添加示例（不同版本参数可能有差异）',
    snippet: 'claude mcp add cellstack -- npx -y @mcell/stack-mcp',
  },
  {
    title: 'Memo Code',
    subtitle: 'CLI 添加示例（与 Codex 风格一致）',
    snippet: 'memo mcp add cellstack -- npx -y @mcell/stack-mcp',
  },
  {
    title: '标准 MCP 配置',
    subtitle: '适用于支持 mcpServers 的通用客户端',
    snippet: `{
  "mcpServers": {
    "cellstack": {
      "command": "npx",
      "args": ["-y", "@mcell/stack-mcp"]
    }
  }
}`,
  },
]

export default function StackMcpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
      >
        ← 返回首页
      </Link>

      <header className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight mb-3">
          MCP Server
        </h1>
        <p className="text-muted-foreground">
          CellStack MCP Server 是一个标准的 MCP 服务器，可被支持 MCP
          的客户端接入。可以让客户端通过 MCP 协议调用 CellStack 的功能，快速集成
          CellStack 到现有的 Agent 系统中。关于 MCP 协议的详细介绍和规范，请参考
          <a
            href="https://modelcontextprotocol.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline ml-1"
          >
            What is the Model Context Protocol (MCP)?
          </a>
          。
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          快速接入
        </h2>
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <pre className="text-sm text-foreground overflow-x-auto">
            <code>codex mcp add cellstack -- npx -y @mcell/stack-mcp</code>
          </pre>
        </div>
      </section>

      <hr className="section-divider" />

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          客户端配置
        </h2>
        <div className="space-y-0">
          {guides.map((guide) => (
            <article
              key={guide.title}
              className="py-4 border-b border-border/40 last:border-b-0"
            >
              <h3 className="text-foreground font-medium mb-1">
                {guide.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {guide.subtitle}
              </p>
              <pre className="bg-muted/40 border border-border/60 rounded-md p-3 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                <code>{guide.snippet}</code>
              </pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
