'use client'

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t-4 border-[var(--pixel-purple)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          {/* Logo & Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--pixel-purple)] flex items-center justify-center">
              <span className="font-pixel text-lg text-white">C</span>
            </div>
            <div>
              <p className="font-pixel text-xs text-[var(--pixel-dark)]">CELLSTACK</p>
              <p className="text-sm text-[var(--muted-foreground)]">一个技术博客</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/blog"
              className="text-sm text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors"
            >
              文章
            </Link>
            <Link
              href="/topics"
              className="text-sm text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors"
            >
              专题
            </Link>
            <Link
              href="/me"
              className="text-sm text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors"
            >
              关于
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-[var(--border)] my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
          <p className="font-pixel text-[10px] text-[var(--pixel-dark)]">
            (C) {currentYear} CELLSTACK
          </p>
          
          <div className="flex items-center gap-4">
            <span>用代码写的博客</span>
            <span>|</span>
            <span>Hosted on GitHub Pages</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
