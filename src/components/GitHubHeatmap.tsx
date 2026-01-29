'use client'

import { useRef, useState, useEffect } from 'react'
import { ActivityCalendar, Activity } from 'react-activity-calendar'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GitHubHeatmapProps {
  username?: string
  initialData?: Activity[]
  compact?: boolean
  className?: string
}

const pixelTheme = {
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
}

async function fetchCalendarData(username: string): Promise<Activity[]> {
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    )
    const json = await response.json()
    return json.contributions ?? []
  } catch (error) {
    console.error('Failed to fetch GitHub contributions:', error)
    return []
  }
}

export function GitHubHeatmap({
  username = 'minorcell',
  initialData,
  compact = false,
  className,
}: GitHubHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<Activity[]>(initialData || [])

  useEffect(() => {
    const loadData = async () => {
      const freshData = await fetchCalendarData(username)
      if (freshData.length > 0) {
        setData(freshData)
      }
    }
    loadData()
  }, [username])

  const blockSize = compact ? 11 : 14
  const blockMargin = compact ? 3 : 4
  const fontSize = compact ? 10 : 12

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
      className={cn(
        'mt-12 sm:mt-16 space-y-4',
        compact && 'mt-6',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-pixel text-[8px] uppercase tracking-wider text-[var(--pixel-cyan)]">
            GitHub Activity
          </p>
          <p className="text-lg font-semibold text-[var(--pixel-dark)] mt-2">
            持续编码，日拱一卒。
          </p>
        </div>
      </div>

      <div className="pixel-border p-4 sm:p-6 overflow-x-auto bg-white">
        {data.length > 0 ? (
          <ActivityCalendar
            data={data}
            theme={pixelTheme}
            colorScheme="light"
            blockSize={blockSize}
            blockMargin={blockMargin}
            fontSize={fontSize}
            showWeekdayLabels
            style={{
              fontFamily: 'var(--font-mono)',
            }}
            labels={{
              months: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              totalCount: '{{count}} contributions in last year',
              legend: {
                less: 'Less',
                more: 'More',
              },
            }}
          />
        ) : (
          <div className="h-[128px] w-full flex items-center justify-center text-[var(--muted-foreground)] text-sm font-mono animate-pulse">
            Loading activity data...
          </div>
        )}
      </div>
    </motion.div>
  )
}
