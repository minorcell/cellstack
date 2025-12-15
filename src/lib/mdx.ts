import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const root = process.cwd()
const contentDir = path.join(root, 'content')

export type PostType = 'blog' | 'topics'

export interface PostMetadata {
  title: string
  date: string
  slug: string
  image?: string
  description?: string
  order?: number
  [key: string]: unknown
}

export interface Post {
  metadata: PostMetadata
  content: string
  slug: string
}

// Cache for post slugs to avoid repeated file system traversal
const slugCache = new Map<PostType, string[]>()
// Cache for parsed posts to avoid re-reading and re-parsing files
const postCache = new Map<string, Post>()

export function getPostSlugs(type: PostType) {
  // Return cached result if available
  if (slugCache.has(type)) {
    return slugCache.get(type)!
  }

  const dir = path.join(contentDir, type)
  if (!fs.existsSync(dir)) {
    slugCache.set(type, [])
    return []
  }

  const files: string[] = []

  function traverse(currentDir: string) {
    const items = fs.readdirSync(currentDir)
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        traverse(fullPath)
      } else if (/\.mdx?$/.test(item)) {
        // Create relative path from type dir
        const relativePath = path.relative(dir, fullPath)
        files.push(relativePath)
      }
    }
  }

  traverse(dir)
  slugCache.set(type, files)
  return files
}

export function getPostBySlug(type: PostType, slug: string): Post {
  // Check cache first
  const cacheKey = `${type}:${slug}`
  if (postCache.has(cacheKey)) {
    return postCache.get(cacheKey)!
  }

  const dir = path.join(contentDir, type)
  const realSlug = slug.replace(/\.mdx?$/, '')

  // Try to find the file. slug could be "2025/foo"
  let fullPath = path.join(dir, `${realSlug}.md`)
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(dir, `${realSlug}.mdx`)
  }

  if (!fs.existsSync(fullPath)) {
    // Fallback: maybe the slug is just the filename "foo" and it's inside some folder?
    // This is expensive to search. Let's stick to path-based slugs.
    throw new Error(`Post not found: ${slug}`)
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const parsed = matter(fileContents)
  const data = parsed.data as {
    title?: string
    date?: string | Date
    image?: string
    description?: string
    order?: number
    [key: string]: unknown
  }
  const content = parsed.content

  // Extract first image from content if not provided in frontmatter
  let image = data.image
  if (!image) {
    const imageMatch = content.match(/!\[.*?\]\((.*?)\)/)
    if (imageMatch) {
      image = imageMatch[1]
    }
  }

  const post: Post = {
    slug: realSlug,
    metadata: {
      ...data,
      slug: realSlug,
      title: data.title || path.basename(realSlug),
      date: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      image,
    },
    content,
  }

  // Cache the post
  postCache.set(cacheKey, post)
  return post
}

export function getAllPosts(type: PostType): Post[] {
  const slugs = getPostSlugs(type)
  const posts = slugs
    .map((slug) => getPostBySlug(type, slug))
    .sort((post1, post2) => (post1.slug > post2.slug ? -1 : 1))
  return posts
}

export function getTopicSlugs(): string[] {
  const dir = path.join(contentDir, 'topics')
  if (!fs.existsSync(dir)) return []

  // Cache directory check with readdirSync for better performance
  const items = fs.readdirSync(dir, { withFileTypes: true })
  return items.filter((item) => item.isDirectory()).map((item) => item.name)
}

export function getTopicPosts(topicSlug: string): Post[] {
  // Get only slugs for this topic, avoiding loading all posts
  const slugs = getPostSlugs('topics')
  const topicPrefix = `${topicSlug}/`

  // Filter slugs first before loading posts
  const filteredSlugs = slugs.filter((slug) => slug.startsWith(topicPrefix))

  // Load only the relevant posts
  const posts = filteredSlugs.map((slug) => getPostBySlug('topics', slug))

  const getLeadingNumber = (slug: string) => {
    const last = slug.split('/').pop() ?? slug
    const match = last.match(/^(\d+)/)
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER
  }

  return posts.sort((a, b) => {
    const numA = getLeadingNumber(a.slug)
    const numB = getLeadingNumber(b.slug)
    if (numA !== numB) return numA - numB

    const orderA =
      typeof a.metadata.order === 'number'
        ? a.metadata.order
        : Number.MAX_SAFE_INTEGER
    const orderB =
      typeof b.metadata.order === 'number'
        ? b.metadata.order
        : Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB

    return a.metadata.title.localeCompare(b.metadata.title)
  })
}
