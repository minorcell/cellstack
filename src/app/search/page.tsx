import type { Metadata } from 'next'
import { PagefindSearch } from '@/components/PagefindSearch'

export const metadata: Metadata = {
  title: '搜索',
  description: '使用 Pagefind 搜索本站所有内容',
}

export default function SearchPage() {
  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pixel-cyan)] font-pixel text-[10px] text-white uppercase tracking-wider">
          <span>SEARCH</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl text-[var(--pixel-dark)] tracking-wider">
          搜索文章
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          输入关键词查找你想看的内容
        </p>
      </div>

      <PagefindSearch variant="page" autoFocus />
    </div>
  )
}
