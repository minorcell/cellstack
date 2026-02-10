#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { loadConfig } from './config.js'
import { createStackMcpServer } from './server.js'

async function main() {
  const config = loadConfig()
  const server = createStackMcpServer(config)
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`[stack-mcp] started with index: ${config.indexUrl}`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(`[stack-mcp] fatal: ${message}`)
  process.exit(1)
})
