import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTopics } from '@/lib/topics.server'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: '专题',
  description: '精选技术专题合集，深入探讨各类技术主题',
}

export default function TopicsPage() {
  const topics = getAllTopics()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-3">
          专题
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          精选技术专题合集，深入探讨各类技术主题
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="group block rounded-lg border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-md"
          >
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-foreground/80 transition-colors">
                {topic.title}
              </h2>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {topic.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{topic.articles.length} 篇文章</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无专题内容</p>
        </div>
      )}
    </div>
  )
}
