import type { Metadata } from 'next'
import { Source_Code_Pro, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const sourceSans = Source_Sans_3({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const sourceCodePro = Source_Code_Pro({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CellStack',
    template: '%s | CellStack',
  },
  description: 'Engineering, Design, and Intelligence',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSans.variable} ${sourceCodePro.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Navbar />
        <main className="grow pt-16" data-pagefind-body>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
