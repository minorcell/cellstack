import { getPostBySlug, getPostSlugs } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ZoomImage } from '@/components/ZoomImage';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs('blog');
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx?$/, '').split('/'),
  }));
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const slugString = slug.join('/');
  const post = getPostBySlug('blog', slugString);

  return (
    <article className="max-w-[70vw] mx-auto px-6 sm:px-12">
      <header className="mb-16 text-center">
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider">
          <span>发布于</span>
          <span>·</span>
          <span>{new Date(post.metadata.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black mb-8 leading-tight">
          {post.metadata.title}
        </h1>
      </header>
      
      <div className="prose max-w-[70vw] prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-[#282c34] prose-pre:border prose-pre:border-gray-200">
        <MDXRemote 
          source={post.content} 
          components={{ 
            img: ZoomImage 
          }}
          options={{
            mdxOptions: {
              rehypePlugins: [rehypeHighlight],
            },
          }}
        />
      </div>
    </article>
  );
}
