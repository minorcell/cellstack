import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { getTopicPosts, getTopicSlugs } from '@/lib/mdx'
import { GiscusComments } from '@/components/GiscusComments'
import type { Metadata } from 'next'

const topicMeta: Record<
  string,
  { title: string; meta: string; description: string; level?: string }
> = {
  bun: {
    title: 'Bun 极速指南',
    meta: 'Runtime',
    level: 'Intermediate',
    description:
      '这是一组面向 Node/JavaScript 开发者的 Bun 实战笔记：目标不是“百科全书”，而是让你能更快把 Bun 用在 CLI、脚本和小型服务里。',
  },
  'system-prompt': {
    title: '系统提示词工程',
    meta: 'Prompt Engineering',
    level: 'Advanced',
    description:
      '收集和整理各类优秀的系统提示词（System Prompt），帮助你更好地与 AI 模型进行交互，掌握 LLM 的“指挥艺术”。',
  },
}

const formatDate = (value: string) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export async function generateStaticParams() {
  const topics = getTopicSlugs()
  return topics.map((topic) => ({ topic }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>
}): Promise<Metadata> {
  const { topic } = await params
  const meta =
    topicMeta[topic] ??
    ({ title: topic, meta: 'Topic', description: '专题内容' } as const)

  return {
    title: meta.title,
    description: meta.description,
  }
}

export default async function TopicIndexPage({
  params,
}: {
  params: Promise<{ topic: string }>
}) {
  const { topic } = await params
  const posts = getTopicPosts(topic)
  // Sort posts by date (ascending) to mock a "curriculum" order if needed,
  // currently usually they are sorted new->old, but for a guide usually old->new is better?
  // Let's assume the order returned by getTopicPosts IS the intended order.
  // If getTopicPosts returns new->old, we might want to reverse it for a "Timeline" learning path.
  // For now, let's keep the order and assume the user manages filenames or dates to sort them.
  // Actually, for a learning path, usually "01_", "02_" prefixes in filename control simple sorting.

  const meta =
    topicMeta[topic] ??
    ({
      title: topic,
      meta: 'Topic',
      description: '专题内容',
      level: 'General',
    } as const)
  const discussionTerm = `topics/${topic}`

  return (
    <div className="w-full h-full bg-white">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col pt-24 pb-16 sm:pt-32 sm:pb-24 bg-white">
        {/* Header Section */}
        <header className="relative mb-20 sm:mb-24">
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute right-0 top-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-black/5 border border-black/5 text-[11px] font-bold uppercase tracking-widest text-black/60">
                {meta.meta}
              </span>
              {meta.level && (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-[11px] font-bold uppercase tracking-widest text-blue-600">
                  {meta.level}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-black mb-6 leading-[1.1]">
              {meta.title}
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed mb-8">
              {meta.description}
            </p>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{posts.length} 章节</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>约 {posts.length * 5} 分钟阅读</span>
              </div>
              {posts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>最后更新 {formatDate(posts[0].metadata.date)}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Curriculum / Timeline Section */}
        <section className="relative">
          <div className="absolute left-4 sm:left-6 top-4 bottom-0 w-px bg-gray-200" />

          <div className="space-y-12">
            {posts.map((post, index) => {
              const relativeSlug = post.slug.replace(`${topic}/`, '')
              const indexStr = String(index + 1).padStart(2, '0')

              return (
                <div key={post.slug} className="relative pl-12 sm:pl-20 group">
                  {/* Timeline Marker */}
                  <div className="absolute left-0 sm:left-2 top-0 flex flex-col items-center">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white border-2 border-gray-200 group-hover:border-black group-hover:scale-110 transition-all z-10 flex items-center justify-center">
                      <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-black transition-colors">
                        {indexStr}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/topics/${topic}/${relativeSlug}`}
                    className="block group-hover:translate-x-1 transition-transform duration-300"
                  >
                    <article className=" rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:border-black/5 transition-all">
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                            <span>{formatDate(post.metadata.date)}</span>
                            <span>·</span>
                            <span className="uppercase tracking-wider">
                              Chapter {index + 1}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-black transition-colors">
                            {post.metadata.title}
                          </h2>
                          {post.metadata.description && (
                            <p className="text-gray-500 leading-relaxed line-clamp-2">
                              {post.metadata.description as string}
                            </p>
                          )}

                          <div className="pt-2 flex items-center text-sm font-semibold text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            开始阅读 <ArrowRight className="ml-1 h-3 w-3" />
                          </div>
                        </div>

                        {/* Optional: Add a visual indicator or small image here if available */}
                      </div>
                    </article>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-20 pt-10 border-t border-gray-100">
          <GiscusComments term={discussionTerm} />
        </section>
      </div>
    </div>
  )
}
