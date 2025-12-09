declare module '/pagefind/pagefind.js' {
  type PagefindResult = {
    url: string
    excerpt?: string
    content?: string
    meta?: Record<string, string>
  }

  type PagefindHit = {
    id?: string
    data: () => Promise<PagefindResult>
  }

  export function init(): Promise<void>
  export function options(opts?: { basePath?: string; baseUrl?: string }): Promise<void>
  export function search(query: string): Promise<{ results: PagefindHit[] }>
}
