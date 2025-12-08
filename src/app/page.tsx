import type { Metadata } from 'next'
import { HomeHero } from '@/components/HomeHero'

export const metadata: Metadata = {
  title: { absolute: 'CellStack' },
  description: 'Engineering · Design · Intelligence',
}

export default function Home() {
  return <HomeHero />
}
