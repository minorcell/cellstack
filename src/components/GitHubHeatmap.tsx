'use client'

import { useRef, useState, useEffect } from 'react'
import { ActivityCalendar, Activity } from 'react-activity-calendar'
import { motion } from 'framer-motion'

interface GitHubHeatmapProps {
  username?: string
  initialData?: Activity[]
}

const minimalTheme = {
  light: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
}

// Function to fetch data (shared for consistent logic if needed, or just defined inside)
async function fetchCalendarData(username: string): Promise<Activity[]> {
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
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
  initialData 
}: GitHubHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<Activity[]>(initialData || [])

  useEffect(() => {
    // If no initial data, or to ensure we have the very latest (optional strategy),
    // we can fetch on mount.
    // If we have initialData (from build), we might skip this or do it silently.
    // Let's fetch to ensure we have up-to-date data for "last year" relative to NOW.
    // The build might be old.
    
    // Only fetch if data is empty OR we want to revalidate
    // For "speed", we rely on initialData. Let's fetch silently to update if needed.
    const loadData = async () => {
        const freshData = await fetchCalendarData(username)
        if (freshData.length > 0) {
           setData(freshData)
        }
    }

    loadData()
  }, [username])

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
        {data.length > 0 ? (
            <ActivityCalendar
              data={data}
              theme={minimalTheme}
              colorScheme="light"
              blockSize={14}
              blockMargin={4}
              fontSize={12}
              showWeekdayLabels
              style={{
                fontFamily: 'var(--font-mono)',
              }}
              labels={{
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                totalCount: '{{count}} contributions in last year',
                legend: {
                  less: 'Less',
                  more: 'More',
                },
              }}
            />
        ) : (
             <div className="h-[128px] w-full flex items-center justify-center text-gray-400 text-sm font-mono animate-pulse">
                Loading activity data...
             </div>
        )}
      </div>
    </motion.div>
  )
}
