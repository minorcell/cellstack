'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Github, ChevronDown, ArrowUpRight, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PagefindSearch } from '@/components/PagefindSearch'

type NavItem = {
  name: string
  href?: string
  children?: NavItem[]
  meta?: string
  description?: string
  panel?: {
    title: string
    description: string
    cta?: { label: string; href: string }
  }
}

const navItems: NavItem[] = [
  { name: '博客', href: '/blog' },
  {
    name: '专题',
    panel: {
      title: '专题',
      description: '深入一个专题',
    },
    children: [
      {
        name: 'Bun 指南',
        href: '/topics/bun',
        meta: 'Runtime',
        description: '安装、脚手架、调试与部署全流程。',
      },
    ],
  },
  { name: '我', href: '/me' },
]

export function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [navActive, setNavActive] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    setOpenDropdown(null)
  }, [pathname])

  const navBackground = isHome
    ? navActive || openDropdown
      ? 'bg-white/95 backdrop-blur'
      : 'bg-transparent'
    : 'bg-white/95 backdrop-blur'

  const activeDropdown = navItems.find(
    (item) =>
      item.name === openDropdown && item.children && item.children.length > 0,
  )

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 py-2 sm:py-1 ${navBackground}`}
      onMouseEnter={() => setNavActive(true)}
      onMouseLeave={() => {
        setNavActive(false)
        setOpenDropdown(null)
      }}
      onBlurCapture={(event) => {
        if (
          event.relatedTarget &&
          (event.currentTarget as HTMLElement).contains(
            event.relatedTarget as Node,
          )
        ) {
          return
        }
        setOpenDropdown(null)
      }}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.svg"
                alt="CellStack logo"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
              <span className="text-xl font-bold tracking-tighter text-black group-hover:opacity-80 transition-opacity">
                CELLSTACK
              </span>
            </Link>

            {/* links */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navItems.map((item) => {
                const hasChildren =
                  Array.isArray(item.children) && item.children.length > 0
                const isOpen = openDropdown === item.name

                if (hasChildren) {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        isOpen ? 'bg-gray-100 text-black' : 'text-gray-600'
                      } hover:bg-gray-100 hover:text-black`}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onFocus={() => setOpenDropdown(item.name)}
                    >
                      {item.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href ?? '#'}
                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true)
                setOpenDropdown(null)
              }}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-gray-200 text-gray-700 hover:text-black hover:border-gray-300 transition-all bg-white/70 backdrop-blur"
            >
              <Search className="h-4 w-4 mr-2" />
              <span>搜索</span>
            </button>
            <a
              href="https://github.com/minorcell/cellstack"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-all"
            >
              <Github className="h-4 w-4 mr-2" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              key={activeDropdown.name}
              className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="bg-white/95 px-2 sm:px-3 py-4 sm:py-5 flex flex-col sm:flex-row gap-5 sm:gap-8">
                <div className="flex-1 min-w-[220px] space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500">
                    {activeDropdown.panel?.title ?? activeDropdown.name}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-semibold text-black">
                    {activeDropdown.panel?.title ?? activeDropdown.name}
                  </h3>
                  {activeDropdown.panel?.description ? (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {activeDropdown.panel.description}
                    </p>
                  ) : null}
                </div>

                <div className="w-1/2 grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {activeDropdown.children!.map((child, idx) => (
                    <motion.div
                      key={child.name}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{
                        duration: 0.15,
                        ease: 'easeOut',
                        delay: 0.03 * idx,
                      }}
                    >
                      <Link
                        href={child.href ?? '#'}
                        className="group flex items-center justify-between gap-2 px-2 py-2 text-sm font-semibold text-black hover:text-blue-600 transition-colors"
                      >
                        <span className="truncate">{child.name}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-blue-600" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <PagefindSearch
          variant="overlay"
          open={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          autoFocus
        />
      </div>
    </nav>
  )
}
