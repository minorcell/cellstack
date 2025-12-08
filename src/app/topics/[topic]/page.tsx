import Link from 'next/link'
import { ArrowRight, List } from 'lucide-react'
import { getTopicPosts, getTopicSlugs } from '@/lib/mdx'
import type { Metadata } from 'next'

const topicMeta: Record<
  string,
  { title: string; meta: string; description: string }
> = {
  bun: {
    title: 'Bun',
    meta: 'Runtime',
    description: 'Bun is a fast JavaScript all-in-one toolkit',
  },
}

const formatDate = (value: string) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
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
  const meta =
    topicMeta[topic] ??
    ({ title: topic, meta: 'Topic', description: '专题内容' } as const)

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col pt-24 pb-16 sm:pt-28 sm:pb-24">
      <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/70 backdrop-blur px-6 sm:px-10 py-10 sm:py-14 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.35)]">
        <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-blue-100 blur-[90px]" />
        <div className="relative">
          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.35em] text-gray-500">
            专题 · {meta.meta}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black mt-4 leading-tight">
            {meta.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mt-4 max-w-3xl leading-relaxed">
            {meta.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {['Runtime', 'TypeScript', 'Full-stack'].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-mono uppercase tracking-[0.15em] text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="mt-14 sm:mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-gray-500">
              目录
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <List className="h-4 w-4" />
            <span className="text-sm">共 {posts.length} 篇</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const relativeSlug = post.slug.replace(`${topic}/`, '')
            return (
              <Link
                key={post.slug}
                href={`/topics/${topic}/${relativeSlug}`}
                className="group rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-5 sm:p-6 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500">
                      {formatDate(post.metadata.date)}
                    </p>
                    <p className="text-lg font-semibold text-black mt-1">
                      {post.metadata.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-black" />
                </div>
                {post.metadata.description ? (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {post.metadata.description as string}
                  </p>
                ) : null}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
