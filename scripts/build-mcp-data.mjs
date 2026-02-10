#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const contentDir = path.join(root, 'content')
const blogDir = path.join(contentDir, 'blog')
const topicsDir = path.join(contentDir, 'topics')
const siteDir = path.join(contentDir, 'site')
const outputDir = path.join(root, 'public', 'mcp')
const articlesDir = path.join(outputDir, 'articles')

const CONTENT_ENTRY_TYPES = new Set(['blog', 'topic_article'])

function walkMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return []

  const files = []

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      if (/\.mdx?$/i.test(entry.name)) {
        files.push(fullPath)
      }
    }
  }

  walk(dir)
  return files
}

function toPosix(value) {
  return value.replace(/\\/g, '/')
}

function toISODate(value) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

function normalizeMetadata(rawMetadata) {
  const normalized = {}
  for (const [key, value] of Object.entries(rawMetadata || {})) {
    if (value instanceof Date) {
      normalized[key] = value.toISOString()
      continue
    }
    normalized[key] = value
  }
  return normalized
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function excerptFromContent(content, maxLength = 180) {
  const text = stripMarkdown(content)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

function getFileName(id) {
  return `${id.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

function safeNumber(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return parsed
}

function createMarkdownDocument({
  id,
  type,
  slug,
  title,
  description,
  date,
  order,
  url,
  sourcePath,
  metadata,
  content,
  extra,
}) {
  const document = `articles/${getFileName(id)}`
  return {
    entry: {
      id,
      type,
      slug,
      title,
      description,
      date,
      order,
      url,
      document,
      extra,
    },
    document: {
      id,
      type,
      slug,
      title,
      description,
      date,
      order,
      url,
      document,
      sourcePath,
      metadata,
      content,
      extra,
    },
  }
}

function readMarkdownEntry(filePath, sourceRoot, kind) {
  const relativePath = toPosix(path.relative(sourceRoot, filePath))
  const parsed = matter(fs.readFileSync(filePath, 'utf8'))
  const metadata = normalizeMetadata(parsed.data || {})

  if (kind === 'blog') {
    const slug = relativePath.replace(/\.mdx?$/i, '')
    const id = `blog:${slug}`
    const title =
      typeof metadata.title === 'string' && metadata.title.trim()
        ? metadata.title.trim()
        : path.basename(slug)
    const description =
      typeof metadata.description === 'string' && metadata.description.trim()
        ? metadata.description.trim()
        : excerptFromContent(parsed.content)
    const date = toISODate(metadata.date)
    const order = safeNumber(metadata.order)

    return createMarkdownDocument({
      id,
      type: 'blog',
      slug,
      title,
      description,
      date,
      order,
      url: `/blog/${slug}`,
      sourcePath: toPosix(path.relative(root, filePath)),
      metadata,
      content: parsed.content,
      extra: {
        section: 'blog',
        contentFormat: 'markdown',
      },
    })
  }

  const withoutExt = relativePath.replace(/\.mdx?$/i, '')
  const baseName = path.basename(withoutExt)
  const topicSlug = toPosix(path.dirname(withoutExt))

  if (baseName === 'index') {
    const id = `topic:${topicSlug}`
    const title =
      typeof metadata.title === 'string' && metadata.title.trim()
        ? metadata.title.trim()
        : topicSlug
    const description =
      typeof metadata.description === 'string' && metadata.description.trim()
        ? metadata.description.trim()
        : excerptFromContent(parsed.content)

    return createMarkdownDocument({
      id,
      type: 'topic',
      slug: topicSlug,
      title,
      description,
      date: toISODate(metadata.date),
      order: safeNumber(metadata.order),
      url: `/topics/${topicSlug}`,
      sourcePath: toPosix(path.relative(root, filePath)),
      metadata,
      content: parsed.content,
      extra: {
        section: 'topics',
        topicSlug,
        contentFormat: 'markdown',
      },
    })
  }

  const articleSlug = baseName
  const topicArticleSlug = `${topicSlug}/${articleSlug}`
  const id = `topic_article:${topicArticleSlug}`
  const title =
    typeof metadata.title === 'string' && metadata.title.trim()
      ? metadata.title.trim()
      : articleSlug
  const description =
    typeof metadata.description === 'string' && metadata.description.trim()
      ? metadata.description.trim()
      : excerptFromContent(parsed.content)

  return createMarkdownDocument({
    id,
    type: 'topic_article',
    slug: topicArticleSlug,
    title,
    description,
    date: toISODate(metadata.date),
    order: safeNumber(metadata.order),
    url: `/topics/${topicArticleSlug}`,
    sourcePath: toPosix(path.relative(root, filePath)),
    metadata,
    content: parsed.content,
    extra: {
      section: 'topics',
      topicSlug,
      articleSlug,
      contentFormat: 'markdown',
    },
  })
}

function siteHomeMarkdown(siteData) {
  const lines = []
  lines.push(`# ${siteData.title || siteData.name || 'Site'}`)
  if (siteData.subtitle) {
    lines.push('')
    lines.push(siteData.subtitle)
  }
  if (siteData.description) {
    lines.push('')
    lines.push(siteData.description)
  }

  if (Array.isArray(siteData.sections) && siteData.sections.length) {
    lines.push('')
    lines.push('## 主要版块')
    for (const section of siteData.sections) {
      if (!section || typeof section !== 'object') continue
      const label =
        typeof section.label === 'string' && section.label.trim()
          ? section.label.trim()
          : '未命名'
      const pathValue =
        typeof section.path === 'string' && section.path.trim()
          ? section.path.trim()
          : '/'
      const description =
        typeof section.description === 'string' && section.description.trim()
          ? section.description.trim()
          : ''
      lines.push(`- [${label}](${pathValue})${description ? `：${description}` : ''}`)
    }
  }

  const github = siteData.contact?.github
  const email = siteData.contact?.email
  if (github || email) {
    lines.push('')
    lines.push('## 联系方式')
    if (github) {
      lines.push(`- GitHub: ${github}`)
    }
    if (email) {
      lines.push(`- Email: ${email}`)
    }
  }

  return `${lines.join('\n')}\n`
}

function meMarkdown(meData) {
  const lines = []
  lines.push(`# ${meData.title || '关于我'}`)
  lines.push('')
  lines.push(`姓名：${meData.name || '未知'}`)
  if (meData.headline) {
    lines.push('')
    lines.push(meData.headline)
  }

  if (Array.isArray(meData.bio) && meData.bio.length) {
    lines.push('')
    lines.push('## 简介')
    for (const item of meData.bio) {
      if (typeof item === 'string' && item.trim()) {
        lines.push(`- ${item.trim()}`)
      }
    }
  }

  lines.push('')
  lines.push('## 基本信息')
  lines.push(`- 主业：${meData.role || '未知'}`)
  lines.push(`- 位置：${meData.location || '未知'}`)

  if (Array.isArray(meData.tags) && meData.tags.length) {
    lines.push('')
    lines.push('## 标签')
    for (const tag of meData.tags) {
      if (typeof tag === 'string' && tag.trim()) {
        lines.push(`- ${tag.trim()}`)
      }
    }
  }

  if (Array.isArray(meData.skills) && meData.skills.length) {
    lines.push('')
    lines.push('## 技术栈')
    for (const skill of meData.skills) {
      if (!skill || typeof skill !== 'object') continue
      const name =
        typeof skill.name === 'string' && skill.name.trim()
          ? skill.name.trim()
          : '未知技能'
      const level = safeNumber(skill.level)
      lines.push(`- ${name}${typeof level === 'number' ? ` (${level}%)` : ''}`)
    }
  }

  if (Array.isArray(meData.socials) && meData.socials.length) {
    lines.push('')
    lines.push('## 联系方式')
    for (const item of meData.socials) {
      if (!item || typeof item !== 'object') continue
      const label =
        typeof item.label === 'string' && item.label.trim()
          ? item.label.trim()
          : '链接'
      const href =
        typeof item.href === 'string' && item.href.trim()
          ? item.href.trim()
          : ''
      const note =
        typeof item.note === 'string' && item.note.trim()
          ? item.note.trim()
          : ''
      if (!href) continue
      lines.push(`- ${label}: ${href}${note ? ` (${note})` : ''}`)
    }
  }

  return `${lines.join('\n')}\n`
}

function readSiteEntries() {
  const entries = []

  const sitePath = path.join(siteDir, 'site.json')
  const mePath = path.join(siteDir, 'me.json')
  const siteData = readJsonFile(sitePath)
  const meData = readJsonFile(mePath)

  if (siteData && typeof siteData === 'object') {
    entries.push(
      createMarkdownDocument({
        id: 'site:home',
        type: 'site_page',
        slug: 'home',
        title:
          typeof siteData.title === 'string' && siteData.title.trim()
            ? siteData.title.trim()
            : 'CellStack',
        description:
          typeof siteData.description === 'string' && siteData.description.trim()
            ? siteData.description.trim()
            : '站点介绍',
        url: '/',
        sourcePath: toPosix(path.relative(root, sitePath)),
        metadata: siteData,
        content: siteHomeMarkdown(siteData),
        extra: {
          page: 'home',
          contentFormat: 'markdown',
        },
      }),
    )
  }

  if (meData && typeof meData === 'object') {
    entries.push(
      createMarkdownDocument({
        id: 'profile:me',
        type: 'profile',
        slug: 'me',
        title:
          typeof meData.title === 'string' && meData.title.trim()
            ? meData.title.trim()
            : '关于我',
        description:
          typeof meData.headline === 'string' && meData.headline.trim()
            ? meData.headline.trim()
            : '作者介绍',
        url: '/me',
        sourcePath: toPosix(path.relative(root, mePath)),
        metadata: meData,
        content: meMarkdown(meData),
        extra: {
          page: 'me',
          contentFormat: 'markdown',
        },
      }),
    )
  }

  return entries
}

function sortEntries(a, b) {
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

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`)
}

function enrichTopicRelations(entries, documentsById) {
  const topicArticlesByTopic = new Map()

  for (const entry of entries) {
    if (entry.type !== 'topic_article') continue
    const topicSlug = entry.extra?.topicSlug
    if (typeof topicSlug !== 'string' || !topicSlug) continue
    const list = topicArticlesByTopic.get(topicSlug) || []
    list.push(entry)
    topicArticlesByTopic.set(topicSlug, list)
  }

  for (const entry of entries) {
    if (entry.type !== 'topic') continue
    const topicSlug = entry.slug
    const topicArticles = topicArticlesByTopic.get(topicSlug) || []
    const articleSlugs = topicArticles.map((item) => item.slug)

    entry.extra = {
      ...(entry.extra || {}),
      articleCount: topicArticles.length,
      articleSlugs,
    }

    const document = documentsById.get(entry.id)
    if (document) {
      document.extra = {
        ...(document.extra || {}),
        articleCount: topicArticles.length,
        articleSlugs,
      }
    }
  }
}

function buildCatalog(entries) {
  const byType = {}
  const idsByType = {}

  for (const entry of entries) {
    byType[entry.type] = (byType[entry.type] || 0) + 1
    if (!idsByType[entry.type]) {
      idsByType[entry.type] = []
    }
    idsByType[entry.type].push(entry.id)
  }

  return {
    byType,
    idsByType,
    contentIds: entries
      .filter((item) => CONTENT_ENTRY_TYPES.has(item.type))
      .map((item) => item.id),
  }
}

function build() {
  fs.rmSync(outputDir, { recursive: true, force: true })
  fs.mkdirSync(articlesDir, { recursive: true })

  const entries = []
  const documents = []

  const blogFiles = walkMarkdownFiles(blogDir)
  for (const filePath of blogFiles) {
    const { entry, document } = readMarkdownEntry(filePath, blogDir, 'blog')
    entries.push(entry)
    documents.push(document)
  }

  const topicFiles = walkMarkdownFiles(topicsDir)
  for (const filePath of topicFiles) {
    const { entry, document } = readMarkdownEntry(filePath, topicsDir, 'topic')
    entries.push(entry)
    documents.push(document)
  }

  const siteEntries = readSiteEntries()
  for (const item of siteEntries) {
    entries.push(item.entry)
    documents.push(item.document)
  }

  const documentsById = new Map(documents.map((item) => [item.id, item]))
  enrichTopicRelations(entries, documentsById)

  entries.sort(sortEntries)

  for (const document of documents) {
    const filePath = path.join(articlesDir, getFileName(document.id))
    writeJson(filePath, document)
  }

  const generatedAt = new Date().toISOString()
  const catalog = buildCatalog(entries)
  const latestEntries = entries
    .filter((item) => CONTENT_ENTRY_TYPES.has(item.type))
    .sort(sortEntries)
    .slice(0, 20)

  writeJson(path.join(outputDir, 'index.json'), {
    version: 2,
    generatedAt,
    total: entries.length,
    stats: catalog.byType,
    entries,
  })

  writeJson(path.join(outputDir, 'latest.json'), {
    version: 2,
    generatedAt,
    entries: latestEntries,
  })

  writeJson(path.join(outputDir, 'catalog.json'), {
    version: 2,
    generatedAt,
    ...catalog,
  })

  console.log(`Built MCP dataset: ${entries.length} entries`)
}

build()
