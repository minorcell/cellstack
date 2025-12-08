'use client'

import Giscus from '@giscus/react'
import clsx from 'clsx'

interface Props {
  term: string
  className?: string
}

export function GiscusComments({ term, className }: Props) {
  return (
    <div
      className={clsx(
        'rounded-3xl border border-gray-200 bg-white/80 backdrop-blur p-6 sm:p-8 shadow-[0_24px_60px_-48px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      <div className="mb-4 sm:mb-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-gray-500">
          Discussion
        </p>
        <p className="text-xl sm:text-2xl font-semibold text-black mt-2">
          欢迎交流与反馈
        </p>
      </div>

      <Giscus
        key={term}
        id="giscus-comments"
        repo="minorcell/cellstack"
        repoId="R_kgDOPdW_4w"
        category="General"
        categoryId="DIC_kwDOPdW_484CuOIM"
        mapping="specific"
        term={term}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="light"
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  )
}
