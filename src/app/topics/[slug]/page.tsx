import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTopic, getTopicWithContent, getAllTopics } from '@/lib/topics.server'
import { ArrowLeft, FileText } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ZoomImage } from '@/components/ZoomImage'
import { MdxPre } from '@/components/MdxPre'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-dark.css'
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Link
        href="/topics"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回专题列表
      </Link>

      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-3">
          {topicWithContent.title}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-6">
          {topicWithContent.description}
        </p>

        {/* 渲染 index.md 的正文内容 */}
        {topicWithContent.content && (
          <div className="prose prose-base max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-transparent prose-pre:border-0 prose-pre:shadow-none prose-pre:m-0 prose-pre:p-0 prose-code:bg-transparent prose-code:p-0 prose-code:rounded-none mb-8 border-b border-border pb-8">
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

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">文章列表</h2>
      </div>

      <div className="space-y-4">
        {sortedArticles.map((article, index) => (
          <Link
            key={article.slug}
            href={`/topics/${slug}/${article.slug}`}
            className="group block rounded-lg border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-foreground/80 transition-colors">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {article.description}
                  </p>
                )}
              </div>
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {sortedArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">该专题暂无文章</p>
        </div>
      )}
    </div>
  )
}
