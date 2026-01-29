import React from 'react'
import Link from 'next/link'
import { getPostBySlug, getPostSlugs } from '@/lib/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ZoomImage } from '@/components/ZoomImage'
import { MdxPre } from '@/components/MdxPre'
import { GiscusComments } from '@/components/GiscusComments'
import type { Metadata } from 'next'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-light.css'

const formatDate = (value: string) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

interface Props {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const slugString = slug.join('/')
  const post = getPostBySlug('blog', slugString)

  return {
    title: post.metadata.title,
    description:
      (typeof post.metadata.description === 'string'
        ? post.metadata.description
        : undefined) ?? post.metadata.title,
  }
}

export async function generateStaticParams() {
  const slugs = getPostSlugs('blog')
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx?$/, '').split('/'),
  }))
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

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const slugString = slug.join('/')
  const post = getPostBySlug('blog', slugString)
  const discussionTerm = `blog/${slugString}`

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[var(--pixel-cyan)] hover:text-[var(--pixel-dark)] transition-colors mb-8 font-pixel text-[10px] uppercase"
        >
          <span>&lt;</span>
          <span>返回文章列表</span>
        </Link>

        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-[var(--pixel-purple)] font-pixel text-[8px] text-white uppercase">
              文章
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-4 font-pixel text-[8px] uppercase">
            <span>{formatDate(post.metadata.date)}</span>
          </div>
          
          <h1 className="font-pixel text-xl sm:text-2xl lg:text-3xl text-[var(--pixel-dark)] mb-6 leading-relaxed tracking-wider">
            {post.metadata.title}
          </h1>
          
          {typeof post.metadata.description === 'string' && (
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
