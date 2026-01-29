import React from 'react'
import Link from 'next/link'
import { getPostBySlug } from '@/lib/mdx'
import { getTopic, getTopicArticle, getAllTopics } from '@/lib/topics.server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ZoomImage } from '@/components/ZoomImage'
import { MdxPre } from '@/components/MdxPre'
import { GiscusComments } from '@/components/GiscusComments'
import type { Metadata } from 'next'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-light.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{
    slug: string
    article: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, article } = await params
  const topic = getTopic(slug)

  if (!topic) {
    return { title: '专题不存在' }
  }

  try {
    const post = getPostBySlug('topics', `${slug}/${article}`)
    return {
      title: `${post.metadata.title} - ${topic.title}`,
      description:
        (typeof post.metadata.description === 'string'
          ? post.metadata.description
          : undefined) ?? post.metadata.title,
    }
  } catch {
    return { title: '文章不存在' }
  }
}

export async function generateStaticParams() {
  const topics = getAllTopics()
  const result: { slug: string; article: string }[] = []

  for (const topic of topics) {
    for (const article of topic.articles) {
      result.push({
        slug: topic.slug,
        article: article.slug,
      })
    }
  }

  return result
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

export default async function TopicArticlePage({ params }: Props) {
  const { slug, article } = await params
  const topic = getTopic(slug)

  if (!topic) {
    notFound()
  }

  const topicArticle = getTopicArticle(slug, article)
  if (!topicArticle) {
    notFound()
  }

  let post
  try {
    post = getPostBySlug('topics', `${slug}/${article}`)
  } catch {
    notFound()
  }

  const discussionTerm = `topics/${slug}/${article}`

  // Find prev/next articles
  const sortedArticles = [...topic.articles].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  )
  const currentIndex = sortedArticles.findIndex((a) => a.slug === article)
  const prevArticle = currentIndex > 0 ? sortedArticles[currentIndex - 1] : null
  const nextArticle =
    currentIndex < sortedArticles.length - 1
      ? sortedArticles[currentIndex + 1]
      : null

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm font-pixel text-[10px] uppercase">
          <Link
            href="/topics"
            className="text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors"
          >
            专题
          </Link>
          <span className="text-[var(--muted-foreground)]">/</span>
          <Link
            href={`/topics/${slug}`}
            className="text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors"
          >
            {topic.title}
          </Link>
          <span className="text-[var(--muted-foreground)]">/</span>
          <span className="text-[var(--muted-foreground)]">第 {currentIndex + 1} 篇</span>
        </div>

        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-[var(--pixel-blue)] font-pixel text-[8px] text-white uppercase">
              第 {currentIndex + 1} / {sortedArticles.length} 篇
            </div>
          </div>
          
          <h1 className="font-pixel text-xl sm:text-2xl lg:text-3xl text-[var(--pixel-dark)] mb-6 leading-relaxed tracking-wider">
            {post.metadata.title}
          </h1>
          
          {post.metadata.description && (
            <p className="text-lg text-[var(--muted-foreground)] border-l-4 border-[var(--pixel-cyan)] pl-4">
              {post.metadata.description}
            </p>
          )}
        </header>

        {/* Content */}
        <div className="pixel-border p-6 sm:p-8 bg-white">
          <div className="prose prose-base sm:prose-lg max-w-none 
            prose-headings:font-pixel prose-headings:text-[var(--pixel-dark)] 
            prose-p:text-[var(--muted-foreground)] 
            prose-a:text-[var(--pixel-cyan)] prose-a:no-underline hover:prose-a:text-[var(--pixel-yellow)]
            prose-pre:bg-[var(--muted)] prose-pre:border-2 prose-pre:border-[var(--border)]
            prose-code:bg-[var(--muted)] prose-code:text-[var(--pixel-cyan)] prose-code:px-1
            prose-strong:text-[var(--pixel-dark)] prose-li:text-[var(--muted-foreground)]
            prose-blockquote:border-l-[var(--pixel-purple)] prose-blockquote:text-[var(--muted-foreground)]">
            <MDXRemote
              source={post.content}
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
        </div>

        {/* Navigation */}
        <div className="mt-12 sm:mt-16 pt-8 border-t-2 border-[var(--pixel-purple)]">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-pixel text-sm text-[var(--pixel-dark)] tracking-wider">继续阅读</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevArticle ? (
              <Link
                href={`/topics/${slug}/${prevArticle.slug}`}
                className="group block pixel-border p-4 hover:border-[var(--pixel-cyan)] transition-all hover:-translate-x-1 bg-white"
              >
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="font-pixel text-[8px] uppercase">上一篇</span>
                </div>
                <div className="font-medium text-[var(--pixel-dark)] group-hover:text-[var(--pixel-blue)] transition-colors">
                  {prevArticle.title}
                </div>
              </Link>
            ) : (
              <div className="pixel-border p-4 opacity-50 bg-white">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
                  <span className="font-pixel text-[8px] uppercase">这是第一篇</span>
                </div>
              </div>
            )}
            
            {nextArticle ? (
              <Link
                href={`/topics/${slug}/${nextArticle.slug}`}
                className="group block pixel-border p-4 hover:border-[var(--pixel-cyan)] transition-all hover:translate-x-1 text-right bg-white"
              >
                <div className="flex items-center justify-end gap-2 text-sm text-[var(--muted-foreground)] mb-2">
                  <span className="font-pixel text-[8px] uppercase">下一篇</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div className="font-medium text-[var(--pixel-dark)] group-hover:text-[var(--pixel-blue)] transition-colors">
                  {nextArticle.title}
                </div>
              </Link>
            ) : (
              <div className="pixel-border p-4 opacity-50 bg-white">
                <div className="flex items-center justify-end gap-2 text-sm text-[var(--muted-foreground)] mb-2">
                  <span className="font-pixel text-[8px] uppercase">这是最后一篇</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12 sm:mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-pixel text-sm text-[var(--pixel-dark)] tracking-wider">留言讨论</h2>
          </div>
          <GiscusComments term={discussionTerm} />
        </div>
      </div>
    </article>
  )
}
