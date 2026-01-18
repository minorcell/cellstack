import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const root = process.cwd()
const topicsDir = path.join(root, 'content', 'topics')

export interface Topic {
  slug: string
  title: string
  description: string
  articles: TopicArticle[]
}

export interface TopicArticle {
  slug: string
  title: string
  description?: string
  date?: string
  order?: number
}

export interface TopicWithContent extends Topic {
  content: string
}

interface TopicIndexMetadata {
  title: string
  description: string
}

/**
 * 扫描专题目录下的所有文章文件（除了 index.md）
 */
function scanTopicArticles(topicSlug: string): TopicArticle[] {
  const topicPath = path.join(topicsDir, topicSlug)

  if (!fs.existsSync(topicPath)) {
    return []
  }

  const files = fs.readdirSync(topicPath)
    .filter(file => {
      // 只读取 .md 文件，排除 index.md
      return /\.md$/.test(file) && file !== 'index.md'
    })

  const articles: TopicArticle[] = []

  for (const file of files) {
    const filePath = path.join(topicPath, file)
    const slug = file.replace(/\.md$/, '')

    try {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const parsed = matter(fileContents)
      const metadata = parsed.data as {
        title?: string
        description?: string
        date?: string | Date
        order?: number
      }

      articles.push({
        slug,
        title: metadata.title || slug,
        description: metadata.description,
        date: metadata.date ? new Date(metadata.date).toISOString() : undefined,
        order: metadata.order,
      })
    } catch (error) {
      console.error(`Error reading article ${file} in topic ${topicSlug}:`, error)
    }
  }

  // 排序：优先使用 order，其次使用 date，最后使用 slug
  articles.sort((a, b) => {
    // 如果有 order，按 order 排序
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order
    }
    if (a.order !== undefined) return -1
    if (b.order !== undefined) return 1

    // 如果有 date，按 date 降序（新的在前）
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    if (a.date) return -1
    if (b.date) return 1

    // 最后按 slug 字母顺序
    return a.slug.localeCompare(b.slug)
  })

  return articles
}

/**
 * 读取专题的 index.md 文件获取专题配置
 */
function readTopicIndex(topicSlug: string, includeContent = false): Topic | TopicWithContent | null {
  const indexPath = path.join(topicsDir, topicSlug, 'index.md')

  if (!fs.existsSync(indexPath)) {
    return null
  }

  try {
    const fileContents = fs.readFileSync(indexPath, 'utf8')
    const parsed = matter(fileContents)
    const metadata = parsed.data as TopicIndexMetadata

    // 自动扫描文章
    const articles = scanTopicArticles(topicSlug)

    const baseTopic = {
      slug: topicSlug,
      title: metadata.title || topicSlug,
      description: metadata.description || '',
      articles,
    }

    if (includeContent) {
      return {
        ...baseTopic,
        content: parsed.content,
      }
    }

    return baseTopic
  } catch (error) {
    console.error(`Error reading topic index for ${topicSlug}:`, error)
    return null
  }
}

/**
 * 获取所有专题
 */
export function getAllTopics(): Topic[] {
  if (!fs.existsSync(topicsDir)) {
    return []
  }

  const topicFolders = fs.readdirSync(topicsDir).filter((item) => {
    const fullPath = path.join(topicsDir, item)
    return fs.statSync(fullPath).isDirectory()
  })

  const topics: Topic[] = []

  for (const folder of topicFolders) {
    const topic = readTopicIndex(folder)
    if (topic) {
      topics.push(topic)
    }
  }

  return topics
}

/**
 * 获取单个专题
 */
export function getTopic(slug: string): Topic | undefined {
  return readTopicIndex(slug, false) as Topic | undefined || undefined
}

/**
 * 获取单个专题（包含内容）
 */
export function getTopicWithContent(slug: string): TopicWithContent | undefined {
  return readTopicIndex(slug, true) as TopicWithContent | undefined || undefined
}

/**
 * 获取专题中的某篇文章配置
 */
export function getTopicArticle(
  topicSlug: string,
  articleSlug: string,
): TopicArticle | undefined {
  const topic = getTopic(topicSlug)
  return topic?.articles.find((a) => a.slug === articleSlug)
}
