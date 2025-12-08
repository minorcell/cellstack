import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '关于我',
  description: 'mCell / minorcell 的个人介绍与联系方式',
}

export default function MeLayout({ children }: { children: ReactNode }) {
  return children
}
