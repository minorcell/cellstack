'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Github, Menu, Search, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { PagefindSearch } from '@/components/PagefindSearch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: '博客', href: '/blog' },
  { label: '关于我', href: '/me' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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

  const renderLinks = (onClick?: () => void) => (
    <>
      {navLinks.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-accent',
              isActive && 'text-foreground bg-accent',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 sm:h-14">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="CellStack"
            width={28}
            height={28}
            className="rounded-md"
            priority
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">CellStack</p>
            <p className="text-xs text-muted-foreground">mCell 的写作间</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {renderLinks()}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="hidden sm:inline-flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            搜索
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="hidden sm:inline-flex"
            asChild
          >
            <a
              href="https://github.com/minorcell/cellstack"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="sm:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="打开菜单"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isClient &&
        mobileOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute right-0 top-0 flex h-full w-[82%] max-w-[360px] translate-x-0 flex-col overflow-hidden border-l border-border/80 bg-background shadow-2xl transition-transform duration-200"
              style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-4 py-2">
                <button
                  type="button"
                  className="group flex flex-1 items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-2 text-left shadow-sm transition hover:border-border"
                  onClick={() => {
                    setMobileOpen(false)
                    setSearchOpen(true)
                  }}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted-foreground shadow-inner">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      搜索
                    </span>
                  </div>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="关闭菜单"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <Separator />

              <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3">
                {renderLinks(() => setMobileOpen(false))}
              </div>

              <Separator />

              <div className="flex items-center gap-2 px-4 py-3 bg-background/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://github.com/minorcell/cellstack"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>,
          document.body,
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
