import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/mdx'

export const metadata: Metadata = {
  title: '文章',
  description: 'CellStack 博客文章列表',
}

const formatDate = (value: string) => {
  const date = new Date(value)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}.${d}`
}

export default function BlogPage() {
  const posts = getAllPosts('blog').sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
  )

  // Group posts by year
  const postsByYear = posts.reduce(
    (acc, post) => {
      const year = new Date(post.metadata.date).getFullYear()
      if (!acc[year]) acc[year] = []
      acc[year].push(post)
      return acc
    },
    {} as Record<number, typeof posts>,
  )

  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight mb-2">
          文章
        </h1>
        <p className="text-muted-foreground text-sm">共 {posts.length} 篇</p>
      </div>

      {/* Posts by Year */}
      <div className="space-y-12">
        {years.map((year) => (
          <section key={year} className="relative">
            {/* Year Watermark */}
            <div className="year-watermark">{year}</div>

            {/* Posts List */}
            <div className="relative pt-8">
              {postsByYear[Number(year)].map((post) => (
                <article key={post.slug} className="article-item">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="article-title block"
                  >
                    {post.metadata.title}
                  </Link>
                  <div className="article-meta flex items-center gap-2">
                    <time>{formatDate(post.metadata.date)}</time>
                    {post.metadata.description && (
                      <span className="text-muted-foreground/60 hidden sm:inline">
                        · {post.metadata.description}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">暂无文章</div>
      )}
    </div>
  )
}
