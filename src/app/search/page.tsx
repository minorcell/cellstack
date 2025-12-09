import type { Metadata } from 'next'
import { PagefindSearch } from '@/components/PagefindSearch'

export const metadata: Metadata = {
  title: '搜索',
  description: '使用 Pagefind 搜索本站所有内容',
}

export default function SearchPage() {
  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="text-center mb-10 sm:mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-4">
          Search
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-black mb-3">搜索</h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          基于 Pagefind 的静态搜索，覆盖博客、专题和其他页面。
        </p>
      </div>

      <PagefindSearch variant="page" autoFocus />
    </div>
  )
}
