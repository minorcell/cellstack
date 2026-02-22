'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { siteContent } from '@/lib/site-content'

const navLinks = [
  { label: '文章', href: '/blog' },
  { label: '专题', href: '/topics' },
]

function McpGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="m14.557 7.875l-.055.054l-5.804 5.691a.183.183 0 0 0-.003.259l.003.003l1.192 1.17a.55.55 0 0 1 .011.776l-.01.01a.575.575 0 0 1-.803 0L7.896 14.67a1.28 1.28 0 0 1 0-1.836l5.805-5.692a1.647 1.647 0 0 0 .031-2.328l-.031-.032l-.034-.032a1.725 1.725 0 0 0-2.405-.002l-4.781 4.69h-.002l-.065.065a.575.575 0 0 1-.803 0a.55.55 0 0 1-.01-.776l.01-.01L10.46 3.96c.65-.636.663-1.678.027-2.329l-.029-.03a1.725 1.725 0 0 0-2.407 0L1.635 7.896a.575.575 0 0 1-.802 0a.55.55 0 0 1-.011-.776l.011-.01L7.25.814a2.875 2.875 0 0 1 4.01 0c.63.613.929 1.49.803 2.36c.88-.125 1.77.166 2.406.787l.034.033a2.743 2.743 0 0 1 .053 3.88m-1.691-1.553a.55.55 0 0 0 .01-.776l-.01-.01a.575.575 0 0 0-.803 0L7.317 10.19a1.725 1.725 0 0 1-2.407 0a1.647 1.647 0 0 1-.03-2.33l.031-.031l4.747-4.655a.55.55 0 0 0 .011-.776l-.011-.01a.575.575 0 0 0-.803 0L4.108 7.042a2.743 2.743 0 0 0 0 3.933a2.876 2.876 0 0 0 4.011 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function GitHubGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M9.096 21.25v-3.146a3.33 3.33 0 0 1 .758-2.115c-3.005-.4-5.28-1.859-5.28-5.798c0-1.666 1.432-3.89 1.432-3.89c-.514-1.13-.5-3.084.06-3.551c0 0 1.95.175 3.847 1.75c1.838-.495 3.764-.554 5.661 0c1.897-1.575 3.848-1.75 3.848-1.75c.558.467.573 2.422.06 3.551c0 0 1.432 2.224 1.432 3.89c0 3.94-2.276 5.398-5.28 5.798a3.33 3.33 0 0 1 .757 2.115v3.146" />
        <path d="M3.086 16.57c.163.554.463 1.066.878 1.496c.414.431.932.77 1.513.988a4.46 4.46 0 0 0 3.62-.216" />
      </g>
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-base font-medium hover:opacity-60 transition-opacity"
        >
          {siteContent.name}
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-opacity ${
                isActive(item.href)
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/stack-mcp"
            className={`text-muted-foreground hover:text-foreground transition-colors ${
              isActive('/stack-mcp') ? 'text-foreground' : ''
            }`}
            aria-label="Stack MCP"
            title="Stack MCP"
          >
            <McpGlyph className="w-4 h-4" />
          </Link>

          {siteContent.contact.github && (
            <a
              href={siteContent.contact.github}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
              title="GitHub"
            >
              <GitHubGlyph className="w-4 h-4" />
            </a>
          )}

          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label="切换主题"
            >
              {theme === 'light' ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
