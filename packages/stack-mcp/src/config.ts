import os from 'node:os'
import path from 'node:path'

const DEFAULT_INDEX_URL = 'https://stack.mcell.top/mcp/index.json'
const DEFAULT_CACHE_TTL_SECONDS = 60 * 30
const DEFAULT_REQUEST_TIMEOUT_SECONDS = 20

export interface StackMcpConfig {
  indexUrl: string
  cacheDir: string
  cacheTtlMs: number
  requestTimeoutMs: number
}

function parsePositiveInt(
  raw: string | undefined,
  fallback: number,
  envName: string,
): number {
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${envName} must be a positive integer`)
  }
  return value
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): StackMcpConfig {
  const indexUrl = (env.STACK_MCP_INDEX_URL || DEFAULT_INDEX_URL).trim()
  if (!indexUrl) {
    throw new Error('STACK_MCP_INDEX_URL cannot be empty')
  }

  const cacheDir = (env.STACK_MCP_CACHE_DIR || path.join(os.homedir(), '.cache', 'stack-mcp')).trim()
  if (!cacheDir) {
    throw new Error('STACK_MCP_CACHE_DIR cannot be empty')
  }

  const cacheTtlSeconds = parsePositiveInt(
    env.STACK_MCP_CACHE_TTL_SECONDS,
    DEFAULT_CACHE_TTL_SECONDS,
    'STACK_MCP_CACHE_TTL_SECONDS',
  )

  const requestTimeoutSeconds = parsePositiveInt(
    env.STACK_MCP_REQUEST_TIMEOUT_SECONDS,
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
    'STACK_MCP_REQUEST_TIMEOUT_SECONDS',
  )

  return {
    indexUrl,
    cacheDir,
    cacheTtlMs: cacheTtlSeconds * 1000,
    requestTimeoutMs: requestTimeoutSeconds * 1000,
  }
}
