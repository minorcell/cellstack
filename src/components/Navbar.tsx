'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Github,
  ChevronDown,
  ArrowUpRight,
  Search,
  Menu,
  X,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
      {
        name: '系统提示词',
        href: '/topics/system-prompt',
        meta: 'Prompt Engineering',
        description: '收集和整理各类优秀的系统提示词（System Prompt）。',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOpenDropdown(null)
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const navBackground = isHome
    ? navActive || openDropdown
      ? 'bg-white/80 backdrop-blur-md border-b border-black/5'
      : 'bg-transparent border-transparent'
    : 'bg-white/80 backdrop-blur-md border-b border-black/5'

  const activeDropdown = navItems.find(
    (item) =>
      item.name === openDropdown && item.children && item.children.length > 0,
  )

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBackground}`}
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
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="flex justify-between items-center h-14 sm:h-20">
          <div className="flex items-center gap-8 sm:gap-12">
            <Link href="/" className="flex items-center gap-2.5 group relative">
              <div className="relative z-10">
                <Image
                  src="/logo.svg"
                  alt="CellStack logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 group-hover:scale-110 transition-transform duration-300"
                  priority
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-black flex items-center gap-1">
                CellStack
              </span>
            </Link>

            {/* links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const hasChildren =
                  Array.isArray(item.children) && item.children.length > 0
                const isOpen = openDropdown === item.name

                if (hasChildren) {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        isOpen
                          ? 'bg-black/5 text-black'
                          : 'text-gray-600 hover:bg-black/5 hover:text-black'
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onFocus={() => setOpenDropdown(item.name)}
                    >
                      {item.name}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href ?? '#'}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors rounded-full hover:bg-black/5"
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true)
                setOpenDropdown(null)
              }}
              className="group inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:h-9 sm:px-4 rounded-full border border-black/5 bg-black/2 hover:bg-black/5 hover:border-black/10 text-gray-600 hover:text-black transition-all"
            >
              <Search className="h-4 w-4 sm:mr-2 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline text-sm font-medium">搜索</span>
            </button>
            <a
              href="https://github.com/minorcell/cellstack"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:text-black hover:bg-black/5 transition-all"
            >
              <Github className="h-5 w-5" />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-100 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            key={activeDropdown.name}
            className="absolute left-0 right-0 top-full overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Background with blur and improved shadow/border */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm" />
            
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative py-8">
              <div className="flex flex-col sm:flex-row gap-12">
                {/* Left Panel: Featured Content or Section Description */}
                <div className="flex-none w-[280px] space-y-4">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-black/5 border border-black/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/70">
                      {activeDropdown.panel?.title ?? activeDropdown.name}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-black tracking-tight mb-2">
                       探索{activeDropdown.name}
                    </h3>
                    {activeDropdown.panel?.description && (
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        {activeDropdown.panel.description}
                      </p>
                    )}
                  </div>

                  {activeDropdown.panel?.cta && (
                    <Link 
                      href={activeDropdown.panel.cta.href}
                      className="inline-flex items-center text-sm font-semibold text-black hover:text-gray-600 transition-colors mt-2"
                    >
                      {activeDropdown.panel.cta.label}
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block w-px bg-linear-to-b from-black/5 via-black/5 to-transparent" />

                {/* Right Panel: Grid of Links */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  {activeDropdown.children!.map((child, idx) => (
                    <motion.div
                      key={child.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeOut',
                        delay: 0.05 + 0.03 * idx,
                      }}
                    >
                      <Link
                        href={child.href ?? '#'}
                        className="group block h-full p-4 rounded-xl hover:bg-white hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-transparent hover:border-black/5 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-medium text-blue-600/80 group-hover:text-blue-600 transition-colors">
                             {child.meta}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 group-hover:text-black mb-1.5 transition-colors">
                          {child.name}
                        </h4>
                        {child.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed group-hover:text-gray-600">
                            {child.description}
                          </p>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
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

      {/* Mobile Menu */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 md:hidden bg-black/40 backdrop-blur-sm z-60 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
            >
               {/* Mobile Menu Content same as desktop but simpler logic if needed, 
                   or purely reusing existing logic but styling updated */}
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
                initial={{ x: '100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <span className="text-lg font-bold">Menu</span>
                    <button 
                       onClick={() => setMobileMenuOpen(false)}
                       className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                       <X className="h-5 w-5" />
                    </button>
                 </div>
                
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                  {navItems.map((item) => {
                    const hasChildren =
                      Array.isArray(item.children) && item.children.length > 0

                    if (hasChildren) {
                      return (
                        <div key={item.name} className="space-y-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            {item.name}
                          </p>
                          <div className="space-y-3">
                            {item.children!.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href ?? '#'}
                                className="block p-4 rounded-xl bg-gray-50 border border-gray-100/50 active:scale-[0.98] transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                   <span className="text-xs font-medium text-blue-600">
                                      {child.meta}
                                   </span>
                                   <ArrowUpRight className="h-3.5 w-3.5 text-gray-400" />
                                </div>
                                <p className="text-base font-bold text-gray-900 icon-text-gap">
                                  {child.name}
                                </p>
                                {child.description && (
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                      {child.description}
                                    </p>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href ?? '#'}
                        className="block text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                   <a
                      href="https://github.com/minorcell/cellstack"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3.5 rounded-xl text-white bg-black hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98]"
                    >
                      <Github className="h-4 w-4" />
                      <span className="font-semibold text-sm">Follow on GitHub</span>
                    </a>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </nav>
  )
}
