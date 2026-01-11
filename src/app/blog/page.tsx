import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { getAllPosts } from '@/lib/mdx'
import {
  Badge,
  Card,
  CardContent,
  Separator,
} from '@/components/ui'

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

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-16 sm:py-20">
      <div className="text-center space-y-3 sm:space-y-4">
        <Badge variant="secondary" className="px-3 py-1 text-xs">
          Blog
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-semibold text-foreground">
          博客
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          记录工程实践、写作思路和偶尔的生活碎片。
        </p>
      </div>

      <div className="mt-12 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {posts.map((post, index) => (
            <Card key={post.slug} className="h-full border-border/80">
              <CardContent className="flex h-full flex-col gap-3 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(post.metadata.date)}</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span>第 {posts.length - index} 篇</span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group space-y-2"
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground group-hover:underline underline-offset-4">
                    {post.metadata.title}
                  </h2>
                  {typeof post.metadata.description === 'string' && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.metadata.description}
                    </p>
                  )}
                </Link>
                {post.metadata.image && (
                  <div className="relative overflow-hidden rounded-lg border border-border/70 bg-muted/50">
                    <img
                      src={post.metadata.image}
                      alt={post.metadata.title}
                      className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>全文</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
