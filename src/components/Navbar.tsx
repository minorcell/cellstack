'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { PagefindSearch } from '@/components/PagefindSearch'
import type { Topic } from '@/lib/topics'
import { cn } from '@/lib/utils'
import { siteContent } from '@/lib/site-content'

const navLinks = [
  { label: '文章', href: '/blog' },
  { label: '专题', href: '/topics', hasDropdown: true },
  { label: '关于', href: '/me' },
]

interface NavbarProps {
  topics: Topic[]
}

export function Navbar({ topics }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [topicsDropdownOpen, setTopicsDropdownOpen] = useState(false)
  const isClient = typeof window !== 'undefined'

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[var(--pixel-purple)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 pixel-border overflow-hidden">
            <Image
              src="https://avatars.githubusercontent.com/u/120795714"
              alt="mCell"
              width={40}
              height={40}
              className="object-cover"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <p className="font-pixel text-sm text-[var(--pixel-dark)] tracking-wider group-hover:text-[var(--pixel-purple)] transition-colors">
              CELLSTACK
            </p>
            <p className="text-sm text-[var(--pixel-cyan)]">{siteContent.subtitle}</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <div key={item.href} className="relative">
              {item.hasDropdown ? (
                <div className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 font-pixel text-[12px] uppercase tracking-wider transition-all',
                      isActive(item.href)
                        ? 'bg-[var(--pixel-purple)] text-white'
                        : 'text-[var(--pixel-cyan)] hover:bg-[var(--pixel-purple)]/10 hover:text-[var(--pixel-dark)]'
                    )}
                  >
                    <span>{item.label}</span>
                    <span className="text-[8px] opacity-60">v</span>
                  </Link>

                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full mt-2 hidden group-hover:block min-w-[280px]">
                    <div className="pixel-border bg-white p-2 shadow-xl">
                      <div className="font-pixel text-[8px] text-[var(--pixel-yellow)] mb-2 px-2 uppercase">
                        主题列表
                      </div>
                      {topics.map((topic, tIndex) => (
                        <Link
                          key={topic.slug}
                          href={`/topics/${topic.slug}`}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--pixel-purple)]/10 transition-colors group/item"
                        >
                          <span className="text-[var(--pixel-cyan)] font-pixel text-[10px]">
                            {String(tIndex + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-[var(--pixel-dark)] font-medium truncate group-hover/item:text-[var(--pixel-purple)]">
                              {topic.title}
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)] truncate">
                              {topic.description}
                            </div>
                          </div>
                          <span className="text-[var(--pixel-green)] text-xs opacity-0 group-hover/item:opacity-100">
                            &gt;
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 font-pixel text-[12px] uppercase tracking-wider transition-all',
                      isActive(item.href)
                        ? 'bg-[var(--pixel-purple)] text-white'
                        : 'text-[var(--pixel-cyan)] hover:bg-[var(--pixel-purple)]/10 hover:text-[var(--pixel-dark)]'
                    )}
                  >
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 font-pixel text-[12px] text-[var(--pixel-yellow)] hover:bg-[var(--pixel-yellow)]/10 transition-colors"
          >
            <span>搜索</span>
          </button>

          <a
            href="https://github.com/minorcell/cellstack"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2 text-[var(--pixel-cyan)]"
            aria-label="打开菜单"
          >
            <span className="font-pixel text-[12px]">菜单</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isClient &&
        mobileOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute right-0 top-0 h-full w-[85%] max-w-[360px] bg-white border-l-4 border-[var(--pixel-purple)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-4 border-[var(--pixel-purple)]">
                <span className="font-pixel text-xs text-[var(--pixel-yellow)]">菜单</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] text-xl"
                >
                  X
                </button>
              </div>

              {/* Search */}
              <button
                onClick={() => {
                  setMobileOpen(false)
                  setSearchOpen(true)
                }}
                className="w-full flex items-center gap-3 p-4 border-b-2 border-[var(--pixel-purple)]/20 hover:bg-[var(--pixel-purple)]/5 transition-colors"
              >
                <span className="font-pixel text-[10px] text-[var(--pixel-yellow)]">搜索</span>
                <div className="text-left">
                  <div className="text-[var(--pixel-dark)]">查找文章</div>
                </div>
              </button>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                {navLinks.map((item) => (
                  <div key={item.href}>
                    {item.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => setTopicsDropdownOpen(!topicsDropdownOpen)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                            isActive(item.href)
                              ? 'bg-[var(--pixel-purple)]/10'
                              : 'hover:bg-[var(--pixel-purple)]/5'
                          )}
                        >
                          <span className="text-[var(--pixel-dark)]">{item.label}</span>
                          <span className={cn(
                            'ml-auto text-[var(--pixel-cyan)] transition-transform',
                            topicsDropdownOpen && 'rotate-180'
                          )}>v</span>
                        </button>
                        {topicsDropdownOpen && (
                          <div className="ml-4 border-l-2 border-[var(--pixel-purple)] pl-2 mt-1 space-y-1">
                            {topics.map((topic, tIndex) => (
                              <Link
                                key={topic.slug}
                                href={`/topics/${topic.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--pixel-purple)]/5 transition-colors"
                              >
                                <span className="text-[var(--pixel-cyan)] font-pixel text-[10px]">
                                  {String(tIndex + 1).padStart(2, '0')}
                                </span>
                                <span className="text-sm text-[var(--pixel-dark)]">{topic.title}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 transition-colors',
                          isActive(item.href)
                            ? 'bg-[var(--pixel-purple)]/10'
                            : 'hover:bg-[var(--pixel-purple)]/5'
                        )}
                      >
                        <span className="text-[var(--pixel-dark)]">{item.label}</span>
                        {isActive(item.href) && (
                          <span className="ml-auto text-[var(--pixel-green)]">&gt;</span>
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t-4 border-[var(--pixel-purple)]">
                <a
                  href="https://github.com/minorcell/cellstack"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}

      <PagefindSearch
        variant="overlay"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        autoFocus
      />
    </header>
  )
}
