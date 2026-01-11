import Link from 'next/link'
import { ArrowUpRight, NotebookPen } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { getAllPosts } from '@/lib/mdx'

const formatDate = (value: string) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export async function HomeHero() {
  const posts = getAllPosts('blog')
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime(),
    )
    .slice(0, 3)

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.08),transparent_25%)]" />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 space-y-10 sm:space-y-14">
        <div className="space-y-4 sm:space-y-5">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            mCell · 个人博客
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-foreground">
            写代码的间隙，记下能复用的经验与想法。
          </h1>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/blog">
                <NotebookPen className="mr-2 h-4 w-4" />
                开始阅读
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/me">关于我</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="border-border/80 bg-card/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">最近写的</CardTitle>
              <p className="text-sm text-muted-foreground">
                最新 3 篇文章，更多内容在「博客」里。
              </p>
            </CardHeader>
            <CardContent className="space-y-1">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-lg px-4 py-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {post.metadata.title}
                      </p>
                      {typeof post.metadata.description === 'string' && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.metadata.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(post.metadata.date)}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
