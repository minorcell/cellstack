'use client'

import Giscus from '@giscus/react'
import { cn } from '@/lib/utils'

interface Props {
  term: string
  className?: string
}

export function GiscusComments({ term, className }: Props) {
  return (
    <div className={cn(className)}>
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
