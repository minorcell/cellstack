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
        'pixel-border p-6 sm:p-8 bg-white',
        className,
      )}
    >
      <div className="mb-4 sm:mb-6">
        <p className="font-pixel text-[8px] uppercase tracking-wider text-[var(--pixel-cyan)]">
          Discussion
        </p>
        <p className="text-xl sm:text-2xl font-semibold text-[var(--pixel-dark)] mt-2">
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
