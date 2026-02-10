import fs from 'node:fs'
import path from 'node:path'
import type { StackMcpConfig } from './config.js'
import type { DatasetDocument, DatasetEntry, DatasetIndex } from './types.js'

interface CacheResult {
  payload: unknown
  stale: boolean
}

interface MemoryCache<T> {
  value: T
  expiresAt: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(
  raw: Record<string, unknown>,
  key: string,
  allowEmpty = false,
): string {
  const value = raw[key]
  if (typeof value !== 'string') {
    throw new Error(`Invalid field "${key}"`)
  }
  if (!allowEmpty && !value.trim()) {
    throw new Error(`Invalid field "${key}"`)
  }
  return value
}

function readOptionalString(
  raw: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = raw[key]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') {
    throw new Error(`Invalid field "${key}"`)
  }
  const trimmed = value.trim()
  return trimmed || undefined
}

function readOptionalNumber(
  raw: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = raw[key]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid field "${key}"`)
  }
  return value
}

function readOptionalRecord(
  raw: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = raw[key]
  if (value === undefined || value === null) return undefined
  if (!isRecord(value)) {
    throw new Error(`Invalid field "${key}"`)
  }
  return value
}

function parseDatasetEntry(raw: unknown): DatasetEntry {
  if (!isRecord(raw)) {
    throw new Error('Invalid dataset entry')
  }

  return {
    id: readString(raw, 'id'),
    type: readString(raw, 'type'),
    slug: readString(raw, 'slug'),
    title: readString(raw, 'title'),
    description: readOptionalString(raw, 'description'),
    date: readOptionalString(raw, 'date'),
    order: readOptionalNumber(raw, 'order'),
    url: readString(raw, 'url'),
    document: readString(raw, 'document'),
    extra: readOptionalRecord(raw, 'extra'),
  }
}

function parseDatasetIndex(raw: unknown): DatasetIndex {
  if (!isRecord(raw)) {
    throw new Error('Invalid dataset index payload')
  }

  const entriesRaw = raw.entries
  if (!Array.isArray(entriesRaw)) {
    throw new Error('Invalid dataset index entries')
  }

  return {
    version: typeof raw.version === 'number' ? raw.version : 1,
    generatedAt: readString(raw, 'generatedAt'),
    total: typeof raw.total === 'number' ? raw.total : undefined,
    entries: entriesRaw.map((entry) => parseDatasetEntry(entry)),
  }
}

function parseDatasetDocument(raw: unknown): DatasetDocument {
  const entry = parseDatasetEntry(raw)
  if (!isRecord(raw)) {
    throw new Error('Invalid dataset document payload')
  }

  const sourcePath = readString(raw, 'sourcePath')
  const content = readString(raw, 'content', true)
  const metadata = isRecord(raw.metadata) ? raw.metadata : {}

  return {
    ...entry,
    sourcePath,
    metadata,
    content,
  }
}

function compareEntries(a: DatasetEntry, b: DatasetEntry): number {
  if (a.date && b.date) {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  }
  if (a.date) return -1
  if (b.date) return 1

  if (typeof a.order === 'number' && typeof b.order === 'number') {
    return a.order - b.order
  }
  if (typeof a.order === 'number') return -1
  if (typeof b.order === 'number') return 1

  return a.title.localeCompare(b.title)
}

type EntryTypeFilter = string | string[] | undefined

function normalizeTypeFilter(type: EntryTypeFilter): Set<string> | undefined {
  if (!type) return undefined
  if (typeof type === 'string') {
    const value = type.trim()
    return value ? new Set([value]) : undefined
  }
  const normalized = type
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  if (!normalized.length) return undefined
  return new Set(normalized)
}

function toSafeFileName(value: string): string {
  return `${value.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
}

export class DatasetClient {
  private indexCachePath: string
  private documentsCacheDir: string
  private indexMemoryCache?: MemoryCache<DatasetIndex>
  private documentMemoryCache = new Map<string, MemoryCache<DatasetDocument>>()

  constructor(private readonly config: StackMcpConfig) {
    this.indexCachePath = path.join(config.cacheDir, 'index.json')
    this.documentsCacheDir = path.join(config.cacheDir, 'documents')
    fs.mkdirSync(this.documentsCacheDir, { recursive: true })
  }

  private get now() {
    return Date.now()
  }

  private isMemoryCacheValid<T>(cache: MemoryCache<T> | undefined): cache is MemoryCache<T> {
    return !!cache && cache.expiresAt > this.now
  }

  private readCache(filePath: string): CacheResult | undefined {
    if (!fs.existsSync(filePath)) return undefined

    try {
      const stat = fs.statSync(filePath)
      const raw = fs.readFileSync(filePath, 'utf8')
      const payload = JSON.parse(raw) as unknown
      const stale = this.now - stat.mtimeMs > this.config.cacheTtlMs
      return { payload, stale }
    } catch {
      return undefined
    }
  }

  private writeCache(filePath: string, payload: unknown) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`)
  }

  private async fetchJson(url: string): Promise<unknown> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.requestTimeoutMs)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': '@mcell/stack-mcp',
        },
      })

      if (!response.ok) {
        throw new Error(`Request failed (${response.status}) for ${url}`)
      }

      return (await response.json()) as unknown
    } finally {
      clearTimeout(timer)
    }
  }

  async getIndex(forceRefresh = false): Promise<DatasetIndex> {
    if (!forceRefresh && this.isMemoryCacheValid(this.indexMemoryCache)) {
      return this.indexMemoryCache.value
    }

    const diskCache = this.readCache(this.indexCachePath)
    if (!forceRefresh && diskCache && !diskCache.stale) {
      const parsed = parseDatasetIndex(diskCache.payload)
      this.indexMemoryCache = {
        value: parsed,
        expiresAt: this.now + this.config.cacheTtlMs,
      }
      return parsed
    }

    try {
      const payload = await this.fetchJson(this.config.indexUrl)
      const parsed = parseDatasetIndex(payload)
      this.writeCache(this.indexCachePath, payload)
      this.indexMemoryCache = {
        value: parsed,
        expiresAt: this.now + this.config.cacheTtlMs,
      }
      return parsed
    } catch (error) {
      if (diskCache) {
        const parsed = parseDatasetIndex(diskCache.payload)
        this.indexMemoryCache = {
          value: parsed,
          expiresAt: this.now + Math.min(this.config.cacheTtlMs, 5 * 60 * 1000),
        }
        return parsed
      }
      throw error
    }
  }

  private filterEntries(entries: DatasetEntry[], type?: EntryTypeFilter): DatasetEntry[] {
    const filter = normalizeTypeFilter(type)
    if (!filter) return entries
    return entries.filter((entry) => filter.has(entry.type))
  }

  async getEntries(type?: EntryTypeFilter): Promise<DatasetEntry[]> {
    const index = await this.getIndex()
    return this.filterEntries(index.entries, type)
  }

  async listLatest(count: number, type?: EntryTypeFilter): Promise<DatasetEntry[]> {
    const index = await this.getIndex()
    const filtered = this.filterEntries(index.entries, type)

    return [...filtered].sort(compareEntries).slice(0, count)
  }

  async search(query: string, count: number, type?: EntryTypeFilter): Promise<DatasetEntry[]> {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return []

    const index = await this.getIndex()
    const candidates = this.filterEntries(index.entries, type)

    const scored = candidates
      .map((entry) => {
        const haystackTitle = entry.title.toLowerCase()
        const haystackSlug = entry.slug.toLowerCase()
        const haystackDescription = (entry.description || '').toLowerCase()

        let score = 0
        if (haystackTitle.includes(normalizedQuery)) score += 3
        if (haystackSlug.includes(normalizedQuery)) score += 2
        if (haystackDescription.includes(normalizedQuery)) score += 1

        return { entry, score }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score
        return compareEntries(a.entry, b.entry)
      })

    return scored.slice(0, count).map((item) => item.entry)
  }

  async getDocumentById(id: string): Promise<DatasetDocument> {
    const index = await this.getIndex()
    const entry = index.entries.find((item) => item.id === id)
    if (!entry) {
      throw new Error(`Resource not found by id: ${id}`)
    }
    return this.getDocumentByEntry(entry)
  }

  async getDocumentBySlug(slug: string, type?: string): Promise<DatasetDocument> {
    const index = await this.getIndex()
    const entry = index.entries.find((item) => {
      if (item.slug !== slug) return false
      if (!type) return true
      return item.type === type
    })

    if (!entry) {
      throw new Error(`Resource not found by slug: ${slug}`)
    }

    return this.getDocumentByEntry(entry)
  }

  private async getDocumentByEntry(entry: DatasetEntry): Promise<DatasetDocument> {
    const memory = this.documentMemoryCache.get(entry.id)
    if (this.isMemoryCacheValid(memory)) {
      return memory.value
    }

    const cachePath = path.join(this.documentsCacheDir, toSafeFileName(entry.id))
    const diskCache = this.readCache(cachePath)
    if (diskCache && !diskCache.stale) {
      const parsed = parseDatasetDocument(diskCache.payload)
      this.documentMemoryCache.set(entry.id, {
        value: parsed,
        expiresAt: this.now + this.config.cacheTtlMs,
      })
      return parsed
    }

    const documentUrl = new URL(entry.document, this.config.indexUrl).toString()

    try {
      const payload = await this.fetchJson(documentUrl)
      const parsed = parseDatasetDocument(payload)
      this.writeCache(cachePath, payload)
      this.documentMemoryCache.set(entry.id, {
        value: parsed,
        expiresAt: this.now + this.config.cacheTtlMs,
      })
      return parsed
    } catch (error) {
      if (diskCache) {
        const parsed = parseDatasetDocument(diskCache.payload)
        this.documentMemoryCache.set(entry.id, {
          value: parsed,
          expiresAt: this.now + Math.min(this.config.cacheTtlMs, 5 * 60 * 1000),
        })
        return parsed
      }
      throw error
    }
  }

  async refresh() {
    await this.getIndex(true)
  }
}
