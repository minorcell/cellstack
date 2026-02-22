import type { Metadata } from 'next'
import Link from 'next/link'
import { siteContent } from '@/lib/site-content'
import { getAllPosts } from '@/lib/mdx'

export const metadata: Metadata = {
  title: { absolute: siteContent.name },
  description: siteContent.description,
}

const formatDate = (value: string) => {
  const date = new Date(value)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}.${d}`
}

export default function HomePage() {
  // Get recent posts (top 5)
  const posts = getAllPosts('blog')
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header Section */}
      <section className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
          {siteContent.name}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {siteContent.description}
        </p>
      </section>

      {/* Bio Section */}
      <section className="mb-12 space-y-4">
        <p className="text-foreground/85 leading-relaxed">
          你可以在
          <Link
            href="/blog"
            className="underline underline-offset-4 decoration-border hover:decoration-foreground"
          >
            这里
          </Link>
          阅读我的文章， 或者在
          <Link
            href="/topics"
            className="underline underline-offset-4 decoration-border hover:decoration-foreground"
          >
            专题
          </Link>
          中按主题浏览。
        </p>
      </section>

      <hr className="section-divider" />

      {/* Recent Posts */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            最近更新
          </h2>
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            查看全部 →
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-0">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="py-3 border-b border-border/30 last:border-b-0"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-start justify-between gap-4"
                >
                  <span className="font-normal text-foreground group-hover:opacity-60 transition-opacity">
                    {post.metadata.title}
                  </span>
                  <time className="text-sm text-muted-foreground shrink-0">
                    {formatDate(post.metadata.date)}
                  </time>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无文章</p>
        )}
      </section>
    </div>
  )
}
