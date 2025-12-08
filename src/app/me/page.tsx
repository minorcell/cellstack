'use client'

import { Github, Mail, Gamepad2, BookOpen, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { ZoomImage } from '@/components/ZoomImage'

const links = [
  {
    href: 'https://github.com/minorcell',
    icon: Github,
    label: 'GitHub',
    meta: 'Code',
  },
  {
    href: 'https://juejin.cn/user/2280829967146779',
    icon: BookOpen,
    label: 'Juejin',
    meta: 'Writing',
  },
  {
    href: 'mailto:minorcell6789@gmail.com',
    icon: Mail,
    label: 'Email',
    meta: 'Contact',
  },
  {
    href: 'https://steamcommunity.com/profiles/76561199379749961/',
    icon: Gamepad2,
    label: 'Steam',
    meta: 'Play',
  },
]

export default function MePage() {
  return (
    <motion.div
      className="relative overflow-hidden select-none"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-blue-100 blur-[100px]"
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute right-0 top-32 h-72 w-72 rounded-full bg-black/5 blur-[120px]"
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
        />
      </motion.div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: 'easeOut' },
              },
            }}
            className="space-y-6"
          >
            <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.35em] text-gray-500">
              ME
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-tight">
              Engineering. Design. Intelligence.
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-2xl">
              全栈工程师，偏好 TypeScript & Golang。细节控，
              但更执着于速度、可维护性和现场体验。
            </p>
            <div className="flex flex-wrap gap-3">
              {['Full Stack', 'DevOps', 'AI + R3F', 'Product Thinking'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-mono uppercase tracking-[0.15em] text-gray-600"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: 'easeOut', delay: 0.1 },
              },
            }}
            className="relative"
          >
            <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-3xl bg-linear-to-br from-gray-50 to-white" />
            <div className="relative rounded-3xl border border-gray-200 bg-white/70 backdrop-blur p-8 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <ZoomImage
                    src="https://avatars.githubusercontent.com/u/120795714"
                    alt="mCell Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.25em] text-gray-500">
                    mCell / minorcell
                  </p>
                  <p className="text-2xl font-semibold text-black mt-2">
                    Building CellStack
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    产品体验、架构演进、团队节奏三线并行。
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
                    Stack
                  </p>
                  <p className="mt-2 font-semibold text-black">
                    TypeScript / Go
                  </p>
                  <p className="text-xs text-gray-500">Web · Agent · DevOps</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
                    Focus
                  </p>
                  <p className="mt-2 font-semibold text-black">Systems & DX</p>
                  <p className="text-xs text-gray-500">速度 · 可靠 · 可观察</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.section
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: 'easeOut', delay: 0.15 },
            },
          }}
          className="mt-16 sm:mt-20"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.35em] text-gray-500">
                Connect
              </p>
              <p className="text-lg font-semibold text-black mt-2">
                找到我，聊代码、产品和游戏。
              </p>
            </div>
            <div className="h-px w-24 bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {links.map((item, idx) => (
              <motion.a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={
                  item.href.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white/70 backdrop-blur px-5 py-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: 0.08 * idx,
                }}
                whileHover={{
                  y: -6,
                  boxShadow: '0 20px 60px -40px rgba(0,0,0,0.35)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white"
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-gray-500">
                      {item.meta}
                    </p>
                    <p className="text-base font-semibold text-black">
                      {item.label}
                    </p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="text-gray-400 group-hover:text-black"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </motion.div>
              </motion.a>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
