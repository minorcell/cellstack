import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';
import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const posts = getAllPosts('blog');
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="max-w-[80vw] mx-auto min-h-screen flex flex-col">
      <div className="text-center mt-[10vh] mb-[15vh]">
        <h1 className="text-6xl sm:text-6xl tracking-tight text-black">
          Blog
        </h1>
      </div>

      {featuredPost && (
        <div className="flex-1 mb-32">
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-5xl font-bold text-black group-hover:text-blue-600 transition-colors mb-4 leading-tight">
                {featuredPost.metadata.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{new Date(featuredPost.metadata.date).toLocaleDateString('zh-CN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>·</span>
                <span>Published</span>
                <span>·</span>
                <span className="flex items-center text-black group-hover:text-blue-600 transition-colors">
                  阅读最新文章 <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
            
            <div className="aspect-[21/9] w-xl h-auto rounded-2xl overflow-hidden">
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
        <h2 className="text-3xl font-bold text-black mb-16">历史文章</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {remainingPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex items-start justify-between gap-6"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-black group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-tight">
                  {post.metadata.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{new Date(post.metadata.date).toLocaleDateString('zh-CN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>·</span>
                  <span className="flex items-center text-black group-hover:text-blue-600 transition-colors">
                    阅读 <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>

              <div className="w-64 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group-hover:border-gray-300 transition-colors">
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
  );
}
