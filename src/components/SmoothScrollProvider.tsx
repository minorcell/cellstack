'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export function SmoothScrollProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.08,
      syncTouch: true,
      touchInertiaMultiplier: 0.9,
    })

    let frame = 0

    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return null
}
