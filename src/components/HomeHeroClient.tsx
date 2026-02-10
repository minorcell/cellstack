'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PulsingText } from '@/components/TypewriterText'
import { siteContent } from '@/lib/site-content'

interface Post {
  slug: string
  metadata: {
    title: string
    description?: string
    date: string
  }
}

interface HomeHeroClientProps {
  posts: Post[]
}

const formatDate = (value: string) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

// Client-side typewriter component
function ClientTypewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTyping(true)
      let currentIndex = 0

      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
          setTimeout(typeNextChar, 60)
        } else {
          setIsTyping(false)
        }
      }

      typeNextChar()
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, delay])

  return (
    <span>
      {displayedText}
      {isTyping && (
        <motion.span
          className="inline-block w-[8px] h-[1em] bg-[var(--pixel-cyan)] ml-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </span>
  )
}

// Menu Button Component
function MenuButton({ 
  href, 
  color, 
  delay, 
  children 
}: { 
  href: string
  color: 'purple' | 'blue' | 'green' | 'yellow'
  delay: number
  children: React.ReactNode
}) {
  const [showArrow, setShowArrow] = useState(false)

  const colorMap = {
    purple: {
      bg: 'bg-[var(--pixel-purple)]',
      hover: 'hover:bg-[var(--pixel-purple)]/90',
    },
    blue: {
      bg: 'bg-[var(--pixel-blue)]',
      hover: 'hover:bg-[var(--pixel-blue)]/90',
    },
    green: {
      bg: 'bg-[var(--pixel-green)]',
      hover: 'hover:bg-[var(--pixel-green)]/90',
    },
    yellow: {
      bg: 'bg-[var(--pixel-yellow)]',
      hover: 'hover:bg-[var(--pixel-yellow)]/90',
    },
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setShowArrow((prev) => !prev)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link
        href={href}
        className={`
          flex items-center gap-4 w-full p-4 
          ${colorMap[color].bg} ${colorMap[color].hover}
          text-white font-pixel text-[10px] uppercase tracking-wider
          transition-all duration-150
          border-b-4 border-black/20
          active:translate-y-1 active:border-b-0
          hover:translate-x-2
        `}
        data-pixel-click
      >
        <motion.span
          animate={{ x: showArrow ? 4 : 0, opacity: showArrow ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
        >
          &gt;
        </motion.span>
        <span className="flex-1 text-left">{children}</span>
        <span className="text-white/80">&gt;</span>
      </Link>
    </motion.div>
  )
}

export function HomeHeroClient({ posts }: HomeHeroClientProps) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Main Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full">
          {/* Game Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Logo Animation */}
            <motion.div
              className="mb-8 flex justify-center"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-[var(--pixel-purple)] blur-3xl opacity-20 scale-150" />
                
                {/* Pixel Logo */}
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 16 16"
                  className="relative z-10"
                >
                  {/* C shape */}
                  <rect x="2" y="2" width="4" height="2" fill="#7c3aed" />
                  <rect x="2" y="4" width="2" height="8" fill="#7c3aed" />
                  <rect x="2" y="12" width="4" height="2" fill="#7c3aed" />
                  
                  {/* S shape */}
                  <rect x="10" y="2" width="4" height="2" fill="#0891b2" />
                  <rect x="8" y="4" width="2" height="3" fill="#0891b2" />
                  <rect x="10" y="6" width="4" height="2" fill="#0891b2" />
                  <rect x="12" y="8" width="2" height="3" fill="#0891b2" />
                  <rect x="8" y="12" width="4" height="2" fill="#0891b2" />
                </svg>
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-[var(--pixel-dark)] mb-4 tracking-wider">
              <PulsingText text="CELLSTACK" />
            </h1>
            
            {/* Subtitle with typing effect */}
            <div className="text-lg sm:text-xl text-[var(--pixel-cyan)] mb-6 font-body">
              <ClientTypewriter text={siteContent.subtitle} delay={500} />
            </div>

            {/* Description */}
            <p className="text-base text-[var(--muted-foreground)] max-w-lg mx-auto mb-8">
              {siteContent.description}
            </p>
          </motion.div>

          {/* Menu Options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-4 max-w-md mx-auto"
          >
            <MenuButton href="/blog" color="purple" delay={1}>
              随便看看
            </MenuButton>
            <MenuButton href="/topics" color="blue" delay={1.2}>
              按主题阅读
            </MenuButton>
            <MenuButton href="/me" color="green" delay={1.4}>
              关于作者
            </MenuButton>
          </motion.div>

          {/* Tip */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="text-center mt-8 text-sm text-[var(--muted-foreground)]"
          >
            提示：移动鼠标，小精灵会跟着你跑
          </motion.p>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="px-4 py-12 border-t-4 border-[var(--pixel-purple)] bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-pixel text-sm text-[var(--pixel-dark)] tracking-wider">最近更新</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-[var(--pixel-purple)] to-transparent" />
          </div>

          <div className="grid gap-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * index + 2.2 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block pixel-border bg-white p-4 hover:border-[var(--pixel-cyan)] transition-colors"
                  data-pixel
                  data-platform
                >
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-[var(--pixel-purple)] flex items-center justify-center font-pixel text-xs text-white">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-[var(--pixel-dark)] group-hover:text-[var(--pixel-purple)] transition-colors line-clamp-1">
                        {post.metadata.title}
                      </h3>
                      {typeof post.metadata.description === 'string' && (
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-1 mt-1">
                          {post.metadata.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--pixel-cyan)]">
                        <span>{formatDate(post.metadata.date)}</span>
                        <span className="group-hover:translate-x-1 transition-transform">&gt; 阅读</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-center mt-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[var(--pixel-yellow)] hover:text-[var(--pixel-dark)] transition-colors font-pixel text-[10px] uppercase tracking-wider"
            >
              <span>查看全部文章</span>
              <span className="animate-bounce">v</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
