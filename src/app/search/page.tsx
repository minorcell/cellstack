import type { Metadata } from 'next'
import { PagefindSearch } from '@/components/PagefindSearch'

export const metadata: Metadata = {
  title: '搜索',
  description: '搜索本站所有内容',
}

export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight mb-2">
          搜索
        </h1>
        <p className="text-muted-foreground text-sm">
          输入关键词查找你想看的内容
        </p>
      </div>

      <PagefindSearch variant="page" autoFocus />
    </div>
  )
}
