'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  duration: number
}

const colors = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#22c55e', // green
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
]

export function PixelParticles() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [particleId, setParticleId] = useState(0)

  const createParticles = useCallback((x: number, y: number, count = 8) => {
    const newParticles: Particle[] = []
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const velocity = 50 + Math.random() * 50
      
      newParticles.push({
        id: particleId + i,
        x: x + Math.cos(angle) * velocity,
        y: y + Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        duration: 0.5 + Math.random() * 0.5,
      })
    }
    
    setParticles((prev) => [...prev, ...newParticles])
    setParticleId((prev) => prev + count)
    
    // Clean up particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 1000)
  }, [particleId])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Create particles on button/link clicks
      if (target.closest('button') || target.closest('a') || target.closest('[data-pixel-click]')) {
        createParticles(e.clientX, e.clientY)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [createParticles])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9996]">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              y: particle.y - 100,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              ease: 'easeOut',
            }}
            className="absolute"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Floating pixel decorations
export function FloatingPixels() {
  const pixels = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 10 + Math.random() * 20,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pixels.map((pixel) => (
        <motion.div
          key={pixel.id}
          className="absolute rounded-sm"
          style={{
            left: `${pixel.x}%`,
            top: `${pixel.y}%`,
            width: pixel.size,
            height: pixel.size,
            backgroundColor: pixel.color,
            opacity: 0.3,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 180, 360],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: pixel.duration,
            delay: pixel.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// Star field background
export function StarField() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    blinkDuration: 2 + Math.random() * 3,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.blinkDuration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
