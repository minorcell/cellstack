import React from 'react'
import { getPostBySlug, getPostSlugs } from '@/lib/mdx'
import { getTopic, getTopicArticle, getAllTopics } from '@/lib/topics.server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ZoomImage } from '@/components/ZoomImage'
import { MdxPre } from '@/components/MdxPre'
import { GiscusComments } from '@/components/GiscusComments'
import type { Metadata } from 'next'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-dark.css'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl mt-4">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/topics"
            className="hover:text-foreground transition-colors"
          >
            专题
          </Link>
          <span>/</span>
          <Link
            href={`/topics/${slug}`}
            className="hover:text-foreground transition-colors"
          >
            {topic.title}
          </Link>
        </div>

        <header className="mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            {post.metadata.title}
          </h1>
          {post.metadata.description && (
            <p className="text-lg text-muted-foreground">
              {post.metadata.description}
            </p>
          )}
        </header>

        <div className="prose prose-base sm:prose-lg max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-transparent prose-pre:border-0 prose-pre:shadow-none prose-pre:m-0 prose-pre:p-0 prose-code:bg-transparent prose-code:p-0 prose-code:rounded-none">
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

        {/* Navigation */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevArticle ? (
              <Link
                href={`/topics/${slug}/${prevArticle.slug}`}
                className="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>上一篇</span>
                </div>
                <div className="font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                  {prevArticle.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextArticle && (
              <Link
                href={`/topics/${slug}/${nextArticle.slug}`}
                className="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-md text-right"
              >
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                  <span>下一篇</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div className="font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                  {nextArticle.title}
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <GiscusComments term={discussionTerm} />
        </div>
      </div>
    </article>
  )
}
