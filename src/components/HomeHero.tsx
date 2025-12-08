'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight } from 'lucide-react'
import { createPortal } from 'react-dom'

const ThreeBackground = dynamic(
  () =>
    import('@/components/ThreeBackground').then((mod) => mod.ThreeBackground),
  { ssr: false },
)

function BackgroundPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setTarget(document.body)
  }, [])

  if (!target) return null
  return createPortal(<ThreeBackground />, target)
}

export function HomeHero() {
  return (
    <div className="relative min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center overflow-hidden select-none">
      <BackgroundPortal />

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold tracking-tighter mb-6 text-black animate-fade-in opacity-0">
          CELLSTACK
        </h1>

        <p
          className="text-lg sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-light tracking-wide animate-fade-in opacity-0"
          style={{ animationDelay: '0.2s' }}
        >
          ENGINEERING · DESIGN · INTELLIGENCE
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in opacity-0"
          style={{ animationDelay: '0.4s' }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-all hover:scale-105"
          >
            博客
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}
