import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTopic, getTopicWithContent, getAllTopics } from '@/lib/topics.server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ZoomImage } from '@/components/ZoomImage'
import { MdxPre } from '@/components/MdxPre'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-light.css'
import React from 'react'

interface TopicPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const topics = getAllTopics()
  return topics.map((topic) => ({
    slug: topic.slug,
  }))
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params
  const topic = getTopic(slug)

  if (!topic) {
    return {
      title: '专题不存在',
    }
  }

  return {
    title: topic.title,
    description: topic.description,
  }
}

const Paragraph = ({ children }: { children: React.ReactNode }) => {
  const nodes = React.Children.toArray(children)
  const onlyChild = nodes.length === 1 ? nodes[0] : null

  if (
    onlyChild &&
    React.isValidElement(onlyChild) &&
    (onlyChild.type === ZoomImage ||
      (typeof onlyChild.type === 'string' && onlyChild.type === 'img'))
  ) {
    return <figure className="my-8">{onlyChild}</figure>
  }

  return <p>{children}</p>
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params
  const topicWithContent = getTopicWithContent(slug)

  if (!topicWithContent) {
    notFound()
  }

  const sortedArticles = [...topicWithContent.articles].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      {/* Back Link */}
      <Link
        href="/topics"
        className="inline-flex items-center gap-2 text-sm text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors mb-8 font-pixel text-[10px] uppercase"
      >
        <span>&lt;</span>
        <span>返回专题列表</span>
      </Link>

      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 bg-[var(--pixel-blue)] font-pixel text-[8px] text-white uppercase">
            专题
          </div>
        </div>
        
        <h1 className="font-pixel text-2xl sm:text-3xl text-[var(--pixel-dark)] mb-4 tracking-wider">
          {topicWithContent.title}
        </h1>
        <p className="text-[var(--muted-foreground)] text-base sm:text-lg">
          {topicWithContent.description}
        </p>

        {/* 渲染 index.md 的正文内容 */}
        {topicWithContent.content && (
          <div className="mt-8 prose prose-base max-w-none prose-headings:font-pixel prose-headings:text-[var(--pixel-dark)] prose-p:text-[var(--muted-foreground)] prose-a:text-[var(--pixel-cyan)] prose-a:no-underline hover:prose-a:text-[var(--pixel-yellow)] prose-pre:bg-[var(--muted)] prose-pre:border-2 prose-pre:border-[var(--border)] prose-code:bg-[var(--muted)] prose-code:text-[var(--pixel-cyan)] prose-code:px-1 prose-strong:text-[var(--pixel-dark)] prose-li:text-[var(--muted-foreground)] mb-8 border-b-2 border-[var(--pixel-purple)] pb-8">
            <MDXRemote
              source={topicWithContent.content}
              components={{
                img: ZoomImage,
                p: Paragraph,
                pre: MdxPre,
              }}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeHighlight],
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Articles Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-pixel text-sm text-[var(--pixel-dark)] tracking-wider">文章列表</h2>
        <div className="flex-1 h-1 bg-gradient-to-r from-[var(--pixel-blue)] to-transparent" />
        <span className="text-xs text-[var(--pixel-cyan)]">
          共 {sortedArticles.length} 篇
        </span>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {sortedArticles.map((article, index) => (
          <Link
            key={article.slug}
            href={`/topics/${slug}/${article.slug}`}
            className="group block pixel-border bg-white p-5 hover:border-[var(--pixel-cyan)] transition-all hover:translate-x-2 hover:-translate-y-1"
            data-pixel
            data-platform
          >
            <div className="flex items-start gap-4">
              {/* Article Number */}
              <div className="flex-shrink-0 w-12 h-12 bg-[var(--pixel-blue)] flex items-center justify-center font-pixel text-xs text-white group-hover:bg-[var(--pixel-cyan)] transition-colors">
                {String(index + 1).padStart(2, '0')}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-[var(--pixel-dark)] mb-1 group-hover:text-[var(--pixel-blue)] transition-colors">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-[var(--muted-foreground)] text-sm line-clamp-2">
                    {article.description}
                  </p>
                )}
              </div>
              
              {/* Action */}
              <div className="flex-shrink-0 flex items-center gap-2 text-[var(--pixel-cyan)] group-hover:text-[var(--pixel-yellow)] transition-colors">
                <span className="text-xs font-pixel text-[8px] hidden sm:inline">阅读</span>
                <span className="text-lg">&gt;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sortedArticles.length === 0 && (
        <div className="text-center py-12 pixel-border border-[var(--pixel-yellow)] bg-white">
          <p className="font-pixel text-[10px] text-[var(--pixel-yellow)]">
            该专题下暂无文章
          </p>
        </div>
      )}
    </div>
  )
}
