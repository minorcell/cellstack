import React from 'react'
import { getPostBySlug, getPostSlugs } from '@/lib/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ZoomImage } from '@/components/ZoomImage'
import { MdxPre } from '@/components/MdxPre'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-dark.css'

const formatDate = (value: string) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

export async function generateStaticParams() {
  const slugs = getPostSlugs('topics')
  return slugs.map((slugPath) => {
    const segments = slugPath.replace(/\.mdx?$/, '').split('/')
    const [topic, ...rest] = segments
    return { topic, slug: rest }
  })
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

export default async function TopicPostPage({
  params,
}: {
  params: Promise<{ topic: string; slug: string[] }>
}) {
  const { topic, slug } = await params
  const slugString = [topic, ...slug].join('/')
  const post = getPostBySlug('topics', slugString)

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 sm:mb-14 text-center">
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 font-medium uppercase tracking-wider">
            <span>{topic}</span>
            <span>·</span>
            <span>{formatDate(post.metadata.date)}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-6 sm:mb-8 leading-tight">
            {post.metadata.title}
          </h1>
          {post.metadata.description ? (
            <p className="text-base sm:text-lg text-gray-600">
              {post.metadata.description as string}
            </p>
          ) : null}
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
      </div>
    </article>
  )
}
