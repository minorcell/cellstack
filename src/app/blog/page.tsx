import Link from 'next/link'
import { getAllPosts } from '@/lib/mdx'
import { ArrowRight } from 'lucide-react'

const formatDate = (value: string) => {
  const date = new Date(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

export default function BlogPage() {
  const posts = getAllPosts('blog')
  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)

  return (
    <div className="max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
      <div className="text-center mt-16 sm:mt-20 lg:mt-24 mb-16 lg:mb-24">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight text-black">
          Blog
        </h1>
      </div>

      {featuredPost && (
        <div className="flex-1 mb-20 lg:mb-32">
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-black transition-colors mb-4 leading-tight">
                {featuredPost.metadata.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{formatDate(featuredPost.metadata.date)}</span>
                <span>·</span>
                <span>Published</span>
                <span>·</span>
                <span className="flex items-center text-black transition-colors">
                  Read latest <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>

            <div className="aspect-[21/9] w-full rounded-2xl md:rounded-3xl overflow-hidden relative border border-gray-200">
              {featuredPost.metadata.image ? (
                <img
                  src={featuredPost.metadata.image}
                  alt={featuredPost.metadata.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="w-32 h-32 bg-linear-to-t from-blue-300 to-purple-300 rounded-full blur-3xl opacity-50"></div>
                </div>
              )}
            </div>
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-10 sm:mb-16">
          Archive
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {remainingPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col md:flex-row items-start justify-between gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-black transition-colors mb-3 line-clamp-2 leading-tight">
                  {post.metadata.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{formatDate(post.metadata.date)}</span>
                  <span>·</span>
                  <span className="flex items-center text-black transition-colors">
                    Read <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>

              <div className="w-full md:w-48 lg:w-64 aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-gray-100 relative transition-colors">
                {post.metadata.image ? (
                  <img
                    src={post.metadata.image}
                    alt={post.metadata.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="w-12 h-12 bg-linear-to-t from-blue-300/30 to-purple-300/30 rounded-full blur-xl"></div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
