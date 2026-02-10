import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getTopicsData } from '@/lib/topics-data'
import { PixelCompanion } from '@/components/PixelCompanion'
import { PixelParticles, FloatingPixels, StarField } from '@/components/PixelParticles'
import { siteContent } from '@/lib/site-content'

export const metadata: Metadata = {
  title: {
    default: 'CellStack | Pixel Adventure',
    template: '%s | CellStack',
  },
  description: siteContent.description,
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const topics = getTopicsData()

  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">
        {/* Background Effects */}
        <StarField />
        <FloatingPixels />
        
        {/* CRT Overlay */}
        <div className="crt-overlay" />
        
        {/* Pixel Grid Pattern */}
        <div className="fixed inset-0 pixel-grid pointer-events-none z-0" />
        
        <Navbar topics={topics} />
        <main className="grow relative z-10" data-pagefind-body>
          {children}
        </main>
        <Footer />
        
        {/* Interactive Elements */}
        <PixelCompanion />
        <PixelParticles />
      </body>
    </html>
  )
}
