'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Github, Menu, Search, X } from 'lucide-react'
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

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 flex h-full w-[78%] max-w-sm flex-col bg-background shadow-xl border-l border-border"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-md border border-border/60 bg-card grid place-items-center text-xs font-semibold text-muted-foreground">
                  CS
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-foreground">
                    CellStack
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    写代码也写点字
                  </p>
                </div>
              </div>
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

            <div className="flex flex-1 flex-col gap-1 px-4 py-4">
              {renderLinks(() => setMobileOpen(false))}
            </div>

            <Separator />

            <div className="flex items-center gap-2 px-4 py-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setMobileOpen(false)
                  setSearchOpen(true)
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
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
        </div>
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
