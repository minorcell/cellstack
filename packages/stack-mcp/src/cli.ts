#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { loadConfig } from './config.js'
import { createStackMcpServer } from './server.js'

function isDebugEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = (env.STACK_MCP_DEBUG || '').trim().toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes'
}

async function main() {
  const config = loadConfig()
  const server = createStackMcpServer(config)
  const transport = new StdioServerTransport()
  await server.connect(transport)
  if (isDebugEnabled()) {
    console.error(`[stack-mcp] started with index: ${config.indexUrl}`)
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(`[stack-mcp] fatal: ${message}`)
  process.exit(1)
})
