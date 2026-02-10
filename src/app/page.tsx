import type { Metadata } from 'next'
import { HomeHero } from '@/components/HomeHero'
import { siteContent } from '@/lib/site-content'

export const metadata: Metadata = {
  title: { absolute: 'CellStack' },
  description: siteContent.description,
}

export default function Home() {
  return <HomeHero />
}
