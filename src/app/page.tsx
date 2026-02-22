import type { Metadata } from 'next'
import Link from 'next/link'
import DomeGallery, { type ImageItem } from '@/components/DomeGallery'
import { siteContent } from '@/lib/site-content'
import { getAllPosts } from '@/lib/mdx'

export const metadata: Metadata = {
  title: { absolute: siteContent.name },
  description: siteContent.description,
}

const formatDate = (value: string) => {
  const date = new Date(value)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}.${d}`
}

export default function HomePage() {
  const allPosts = getAllPosts('blog').sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
  )

  const posts = allPosts.slice(0, 5)

  const coverImages: ImageItem[] = allPosts
    .map((post) => ({
      src: post.metadata.image ?? '',
      alt: post.metadata.title,
      href: `/blog/${post.slug}`,
    }))
    .filter((image) => image.src.trim().length > 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header Section */}
      <section className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
          {siteContent.name}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {siteContent.description}
        </p>
      </section>

      {/* Bio Section */}
      <section className="mb-12 space-y-4">
        <p className="text-foreground/85 leading-relaxed">
          👋，我是
          <a
            href="https://github.com/minorcell"
            target="_blank"
            className="hover:opacity-100"
          >
            mcell（minorcell）
          </a>
          ，一名前端出身的全栈工程师，目前主要专注于 AI Agent
          相关开发。日常可独立完成 Web、服务端与桌面端应用开发，技术栈以
          TypeScript、Node.js 和 Golang 为主，也在持续深入学习 Rust。
        </p>
        <p className="text-foreground/85 leading-relaxed">
          你可以在
          <Link
            href="/blog"
            className="underline underline-offset-4 decoration-border hover:opacity-100"
          >
            这里
          </Link>
          阅读我的文章， 或者在
          <Link
            href="/topics"
            className="underline underline-offset-4 decoration-border hover:opacity-100"
          >
            专题
          </Link>
          中按主题浏览。
        </p>
      </section>

      <hr className="section-divider" />

      {/* Recent Posts */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            最近更新
          </h2>
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:opacity-100 transition-opacity"
          >
            查看全部 →
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-0">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="py-3 border-b border-border/30 last:border-b-0"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-start justify-between gap-4 hover:opacity-100"
                >
                  <span className="font-normal text-foreground">
                    {post.metadata.title}
                  </span>
                  <time className="text-sm text-muted-foreground shrink-0">
                    {formatDate(post.metadata.date)}
                  </time>
                </Link>
              </article>
            ))}

            {coverImages.length > 0 && (
              <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 overflow-hidden">
                <div className="h-[320px] px-2 sm:h-[400px] sm:px-4 md:h-[480px]">
                  <DomeGallery
                    images={coverImages}
                    fit={0.42}
                    minRadius={420}
                    maxRadius={760}
                    overlayBlurColor="transparent"
                    imageBorderRadius="10px"
                    openedImageBorderRadius="12px"
                    openedImageWidth="min(92vw, 820px)"
                    openedImageHeight="calc(min(92vw, 820px) * 9 / 16)"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无文章</p>
        )}
      </section>
    </div>
  )
}
