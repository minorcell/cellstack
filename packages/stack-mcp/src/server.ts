import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { StackMcpConfig } from './config.js'
import { DatasetClient } from './dataset-client.js'
import type { DatasetDocument, DatasetEntry } from './types.js'

const DEFAULT_CONTENT_TYPES = ['blog', 'topic_article']
const DEFAULT_SITE_TYPES = ['site_page', 'profile']

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

function resolveTypeFilter(
  type: string | undefined,
  types: string[] | undefined,
  fallback?: string[],
): string[] | undefined {
  if (types?.length) {
    return types.map((item) => item.trim()).filter(Boolean)
  }
  if (type?.trim()) {
    return [type.trim()]
  }
  return fallback
}

function formatEntry(entry: DatasetEntry): string {
  const datePart = entry.date ? ` | ${entry.date}` : ''
  const articleCount =
    typeof entry.extra?.articleCount === 'number'
      ? ` | ${entry.extra.articleCount} articles`
      : ''
  return [
    `- ${entry.title}${datePart}${articleCount}`,
    `  id: ${entry.id}`,
    `  slug: ${entry.slug}`,
    `  type: ${entry.type}`,
    `  url: ${entry.url}`,
  ].join('\n')
}

function truncateText(
  input: string,
  maxChars: number,
): { value: string; truncated: boolean } {
  if (input.length <= maxChars) {
    return { value: input, truncated: false }
  }
  return {
    value: `${input.slice(0, maxChars).trimEnd()}\n\n[truncated]`,
    truncated: true,
  }
}

function buildEntryListResponse(title: string, entries: DatasetEntry[]): string {
  if (!entries.length) {
    return `${title}\n\n未找到结果。`
  }

  const lines = entries.map((entry) => formatEntry(entry))
  return `${title}\n\n${lines.join('\n')}`
}

function formatDocumentText(document: DatasetDocument, maxChars: number): {
  text: string
  content: string
  truncated: boolean
} {
  const body = truncateText(document.content, maxChars)
  const text = [
    `title: ${document.title}`,
    `id: ${document.id}`,
    `slug: ${document.slug}`,
    `type: ${document.type}`,
    `date: ${document.date || 'unknown'}`,
    `url: ${document.url}`,
    '',
    body.value,
  ].join('\n')

  return {
    text,
    content: body.value,
    truncated: body.truncated,
  }
}

export function createStackMcpServer(config: StackMcpConfig): McpServer {
  const client = new DatasetClient(config)
  const server = new McpServer({
    name: '@mcell/stack-mcp',
    version: '0.2.1',
  })

  server.tool(
    'read_last',
    'Read latest content entries (blog and topic articles by default).',
    {
      count: z.number().int().min(1).max(20).optional(),
      type: z.string().trim().min(1).optional(),
      types: z.array(z.string().trim().min(1)).max(10).optional(),
    },
    async ({ count = 1, type, types }) => {
      try {
        const typeFilter = resolveTypeFilter(type, types, DEFAULT_CONTENT_TYPES)
        const entries = await client.listLatest(count, typeFilter)
        return {
          structuredContent: { entries },
          content: [
            {
              type: 'text',
              text: buildEntryListResponse(`Latest ${entries.length} entries`, entries),
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `read_last failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  server.tool(
    'read_latest',
    'Alias of read_last.',
    {
      count: z.number().int().min(1).max(20).optional(),
      type: z.string().trim().min(1).optional(),
      types: z.array(z.string().trim().min(1)).max(10).optional(),
    },
    async ({ count = 1, type, types }) => {
      try {
        const typeFilter = resolveTypeFilter(type, types, DEFAULT_CONTENT_TYPES)
        const entries = await client.listLatest(count, typeFilter)
        return {
          structuredContent: { entries },
          content: [
            {
              type: 'text',
              text: buildEntryListResponse(`Latest ${entries.length} entries`, entries),
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `read_latest failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  server.tool(
    'list_resources',
    'List or search resources across blogs, topics, site pages and profiles.',
    {
      query: z.string().trim().min(1).optional(),
      count: z.number().int().min(1).max(50).optional(),
      type: z.string().trim().min(1).optional(),
      types: z.array(z.string().trim().min(1)).max(10).optional(),
    },
    async ({ query, count = 20, type, types }) => {
      try {
        const typeFilter = resolveTypeFilter(type, types)
        const entries = query
          ? await client.search(query, count, typeFilter)
          : await client.listLatest(count, typeFilter)

        return {
          structuredContent: { entries },
          content: [
            {
              type: 'text',
              text: buildEntryListResponse(
                query
                  ? `Resources matched "${query}"`
                  : `Latest ${entries.length} resources`,
                entries,
              ),
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `list_resources failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  server.tool(
    'list_topics',
    'List topic overviews.',
    {
      count: z.number().int().min(1).max(50).optional(),
    },
    async ({ count = 50 }) => {
      try {
        const topics = await client.getEntries('topic')
        const entries = [...topics]
          .sort((a, b) => a.title.localeCompare(b.title))
          .slice(0, count)

        return {
          structuredContent: { entries },
          content: [
            {
              type: 'text',
              text: buildEntryListResponse(`Topics (${entries.length})`, entries),
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `list_topics failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  server.tool(
    'read_resource',
    'Read full markdown content of one resource by id or slug.',
    {
      id: z.string().trim().min(1).optional(),
      slug: z.string().trim().min(1).optional(),
      type: z.string().trim().min(1).optional(),
      max_chars: z.number().int().min(200).max(50000).optional(),
    },
    async ({ id, slug, type, max_chars }) => {
      if (!id && !slug) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'read_resource requires either "id" or "slug".',
            },
          ],
        }
      }

      const maxChars = max_chars ?? 12000

      try {
        const document = id
          ? await client.getDocumentById(id)
          : await client.getDocumentBySlug(slug!, type)

        const formatted = formatDocumentText(document, maxChars)

        return {
          structuredContent: {
            resource: {
              ...document,
              content: formatted.content,
              truncated: formatted.truncated,
            },
          },
          content: [
            {
              type: 'text',
              text: formatted.text,
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `read_resource failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  server.tool(
    'read_site_info',
    'Read site intro and author profile resources.',
    {
      include_profile: z.boolean().optional(),
      max_chars_per_resource: z.number().int().min(200).max(8000).optional(),
    },
    async ({ include_profile = true, max_chars_per_resource }) => {
      const maxChars = max_chars_per_resource ?? 2000
      const types = include_profile ? DEFAULT_SITE_TYPES : ['site_page']

      try {
        const entries = await client.listLatest(10, types)
        const documents = []
        for (const entry of entries) {
          const document = await client.getDocumentById(entry.id)
          documents.push(document)
        }

        const text = documents
          .map((doc) => {
            const formatted = formatDocumentText(doc, maxChars)
            return `## ${doc.title}\n${formatted.text}`
          })
          .join('\n\n')

        return {
          structuredContent: { entries, resources: documents },
          content: [
            {
              type: 'text',
              text: text || 'No site info resources found.',
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `read_site_info failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  server.tool(
    'search_articles',
    'Compatibility alias: search content entries by title/slug/description.',
    {
      query: z.string().trim().min(1),
      count: z.number().int().min(1).max(30).optional(),
      type: z.string().trim().min(1).optional(),
      types: z.array(z.string().trim().min(1)).max(10).optional(),
    },
    async ({ query, count = 10, type, types }) => {
      try {
        const typeFilter = resolveTypeFilter(type, types, DEFAULT_CONTENT_TYPES)
        const entries = await client.search(query, count, typeFilter)
        return {
          structuredContent: { entries },
          content: [
            {
              type: 'text',
              text: buildEntryListResponse(`Search results for "${query}"`, entries),
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `search_articles failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  server.tool(
    'read_article',
    'Compatibility alias of read_resource.',
    {
      id: z.string().trim().min(1).optional(),
      slug: z.string().trim().min(1).optional(),
      type: z.string().trim().min(1).optional(),
      max_chars: z.number().int().min(200).max(50000).optional(),
    },
    async ({ id, slug, type, max_chars }) => {
      if (!id && !slug) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'read_article requires either "id" or "slug".',
            },
          ],
        }
      }

      const maxChars = max_chars ?? 12000

      try {
        const document = id
          ? await client.getDocumentById(id)
          : await client.getDocumentBySlug(slug!, type)

        const formatted = formatDocumentText(document, maxChars)

        return {
          structuredContent: {
            article: {
              ...document,
              content: formatted.content,
              truncated: formatted.truncated,
            },
          },
          content: [
            {
              type: 'text',
              text: formatted.text,
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `read_article failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  server.tool(
    'refresh_index',
    'Force refresh index from remote static dataset.',
    {},
    async () => {
      try {
        await client.refresh()
        return {
          content: [
            {
              type: 'text',
              text: 'Index cache refreshed.',
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `refresh_index failed: ${toErrorMessage(error)}`,
            },
          ],
        }
      }
    },
  )

  return server
}
