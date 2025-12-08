'use client'

import { useRef } from 'react'
import { GitHubCalendar } from 'react-github-calendar'
import { motion } from 'framer-motion'

interface GitHubHeatmapProps {
  username?: string
}

export function GitHubHeatmap({ username = 'minorcell' }: GitHubHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const minimalTheme = {
    light: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  }

  return (
    <motion.div
      ref={containerRef}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 },
        },
      }}
      className="mt-16 sm:mt-20"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.35em] text-gray-500">
            GitHub Activity
          </p>
          <p className="text-lg font-semibold text-black mt-2">
            持续编码，日拱一卒。
          </p>
        </div>
      </div>

      <div className="rounded-2xl flex justify-center border border-gray-200 bg-white/70 backdrop-blur p-6 sm:p-8 overflow-x-auto">
        <GitHubCalendar
          username={username}
          colorScheme="light"
          theme={minimalTheme}
          blockSize={16}
          blockMargin={3.5}
          fontSize={14}
          style={{
            color: '#000000',
            fontFamily: 'var(--font-mono)',
            width: '100%',
          }}
          showWeekdayLabels
        />
      </div>
    </motion.div>
  )
}
