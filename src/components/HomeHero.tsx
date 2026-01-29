import { getAllPosts } from '@/lib/mdx'
import { HomeHeroClient } from './HomeHeroClient'

export async function HomeHero() {
  const posts = getAllPosts('blog')
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime(),
    )
    .slice(0, 3)

  return <HomeHeroClient posts={posts} />
}
