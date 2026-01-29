import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTopics } from '@/lib/topics.server'

export const metadata: Metadata = {
  title: '专题',
  description: '精选技术专题合集，深入探讨各类技术主题',
}

export default function TopicsPage() {
  const topics = getAllTopics()

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pixel-blue)] font-pixel text-[10px] text-white uppercase tracking-wider">
          <span>TOPICS</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl text-[var(--pixel-dark)] tracking-wider">
          专题合集
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          把相关的东西放在一起，方便按需查阅。
          <br className="hidden sm:block" />
          有些还在写，有些已经写完了。
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {topics.map((topic, index) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="group block pixel-border bg-white p-6 hover:border-[var(--pixel-cyan)] transition-all hover:translate-x-1 hover:-translate-y-2"
            data-pixel
            data-platform
          >
            {/* Topic Number */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--pixel-blue)] flex items-center justify-center font-pixel text-xs text-white">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--pixel-cyan)]">
                <span>{topic.articles.length} 篇文章</span>
              </div>
            </div>

            {/* Content */}
            <h2 className="text-xl font-medium text-[var(--pixel-dark)] mb-2 group-hover:text-[var(--pixel-blue)] transition-colors">
              {topic.title}
            </h2>
            <p className="text-[var(--muted-foreground)] text-sm mb-4 line-clamp-2">
              {topic.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted-foreground)]">完成度</span>
                <span className="text-[var(--pixel-green)]">100%</span>
              </div>
              <div className="h-2 bg-[var(--muted)] border border-[var(--border)]">
                <div className="h-full w-full bg-[var(--pixel-green)]" />
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--muted-foreground)]">
                难度: <span className="text-[var(--pixel-yellow)]">中等</span>
              </span>
              <span className="text-xs text-[var(--pixel-cyan)] group-hover:text-[var(--pixel-yellow)] transition-colors">
                进入专题 &gt;
              </span>
            </div>
          </Link>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="text-center py-12 pixel-border border-[var(--pixel-yellow)] bg-white">
          <p className="font-pixel text-[10px] text-[var(--pixel-yellow)]">
            暂无专题数据
          </p>
        </div>
      )}
    </div>
  )
}
