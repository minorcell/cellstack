// 这个文件提供客户端安全的专题类型和数据
// 服务端操作请使用 topics.server.ts

export interface Topic {
  slug: string
  title: string
  description: string
  articles: TopicArticle[]
}

export interface TopicArticle {
  slug: string
  title: string
  description?: string
  order?: number
}

// 这个数组会在构建时被填充
// 在客户端组件中可以安全使用
export const topics: Topic[] = []
