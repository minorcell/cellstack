import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/mdx'

export const metadata: Metadata = {
  title: '博客',
  description: 'CellStack 博客文章归档与最新内容',
}

const formatDate = (value: string) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export default function BlogPage() {
  const posts = getAllPosts('blog').sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() -
      new Date(a.metadata.date).getTime(),
  )

  // Group posts by year
  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.metadata.date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(post)
    return acc
  }, {} as Record<number, typeof posts>)

  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pixel-purple)] font-pixel text-[10px] text-white uppercase tracking-wider">
          <span>BLOG</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl text-[var(--pixel-dark)] tracking-wider">
          文章列表
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          这里堆着一些写代码时随手记下的东西，
          <br className="hidden sm:block" />
          有踩过的坑，也有突然想明白的道理。
        </p>
        
        {/* Stats Bar */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[var(--pixel-blue)]">
            <span className="text-sm text-[var(--pixel-dark)]">共 {posts.length} 篇</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[var(--pixel-green)]">
            <span className="text-sm text-[var(--pixel-dark)]">持续更新中</span>
          </div>
        </div>
      </div>

      {/* Posts by Year */}
      <div className="space-y-12">
        {years.map((year) => (
          <div key={year}>
            {/* Year Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[var(--pixel-purple)] flex items-center justify-center font-pixel text-xs text-white">
                {year}
              </div>
              <div className="flex-1 h-1 bg-gradient-to-r from-[var(--pixel-purple)] to-transparent" />
              <span className="font-pixel text-[10px] text-[var(--pixel-cyan)]">
                {postsByYear[Number(year)].length} 篇
              </span>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postsByYear[Number(year)].map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block pixel-border bg-white p-5 hover:border-[var(--pixel-cyan)] transition-all hover:translate-x-1 hover:-translate-y-2"
                  data-pixel
                  data-platform
                >
                  <div className="flex items-start gap-4">
                    {/* Post Number */}
                    <div className="flex-shrink-0 w-10 h-10 bg-[var(--muted)] border-2 border-[var(--pixel-cyan)] flex items-center justify-center font-pixel text-[10px] text-[var(--pixel-cyan)]">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-2">
                        <span>{formatDate(post.metadata.date)}</span>
                      </div>
                      
                      <h2 className="text-lg font-medium text-[var(--pixel-dark)] group-hover:text-[var(--pixel-purple)] transition-colors line-clamp-2 mb-2">
                        {post.metadata.title}
                      </h2>
                      
                      {typeof post.metadata.description === 'string' && (
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {post.metadata.description}
                        </p>
                      )}

                      {/* Action */}
                      <div className="flex items-center gap-2 mt-3 text-xs text-[var(--pixel-cyan)] group-hover:text-[var(--pixel-yellow)] transition-colors">
                        <span>&gt; 阅读全文</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--pixel-cyan)] pointer-events-none transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Message */}
      <div className="text-center mt-16 p-6 pixel-border border-[var(--pixel-yellow)] bg-white">
        <p className="font-pixel text-[10px] text-[var(--pixel-yellow)] uppercase tracking-wider">
          到底啦
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          更多内容正在酝酿中...
        </p>
      </div>
    </div>
  )
}
