import React from "react";
import { getPostBySlug, getPostSlugs } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ZoomImage } from "@/components/ZoomImage";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";

const formatDate = (value: string) => {
  const date = new Date(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

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

const Paragraph = ({ children }: { children: React.ReactNode }) => {
  const nodes = React.Children.toArray(children);
  const onlyChild = nodes.length === 1 ? nodes[0] : null;

  if (
    onlyChild &&
    React.isValidElement(onlyChild) &&
    (onlyChild.type === ZoomImage || (typeof onlyChild.type === "string" && onlyChild.type === "img"))
  ) {
    return <figure className="my-8">{onlyChild}</figure>;
  }

  return <p>{children}</p>;
};

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const slugString = slug.join('/');
  const post = getPostBySlug('blog', slugString);

  return (
    <article className="max-w-[70vw] mx-auto px-6 sm:px-12">
      <header className="mb-16 text-center">
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider">
          <span>Published</span>
          <span>·</span>
          <span>{formatDate(post.metadata.date)}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black mb-8 leading-tight">
          {post.metadata.title}
        </h1>
      </header>
      
      <div className="prose max-w-[70vw] prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-[#282c34] prose-pre:border prose-pre:border-gray-200">
        <MDXRemote 
          source={post.content} 
          components={{ 
            img: ZoomImage,
            p: Paragraph,
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
