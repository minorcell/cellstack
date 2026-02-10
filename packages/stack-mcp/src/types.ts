export interface DatasetEntry {
  id: string
  type: string
  slug: string
  title: string
  description?: string
  date?: string
  order?: number
  url: string
  document: string
  extra?: Record<string, unknown>
}

export interface DatasetIndex {
  version: number
  generatedAt: string
  total?: number
  entries: DatasetEntry[]
}

export interface DatasetDocument extends DatasetEntry {
  sourcePath: string
  metadata: Record<string, unknown>
  content: string
}
