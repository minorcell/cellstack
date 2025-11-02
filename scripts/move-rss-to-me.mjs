import fs from 'fs'
import path from 'path'

const docs = path.resolve('docs')
const src = path.join(docs, 'topics', 'client', 'add_rss_subscription_to_blog.md')
const dest = path.join(docs, 'me', 'ssr_subscription.md')

function updateFrontmatter(file) {
  const content = fs.readFileSync(file, 'utf8')
  const updated = content.replace(/title:\s*.*\n/, 'title: SSR订阅\n')
  fs.writeFileSync(file, updated, 'utf8')
}

function updateLinks() {
  const targets = []
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (p.endsWith('.md') || p.endsWith('.mjs')) targets.push(p)
    }
  }
  walk(docs)
  for (const f of targets) {
    const content = fs.readFileSync(f, 'utf8')
    let updated = content
    updated = updated.replace(/\/topics\/client\/add_rss_subscription_to_blog(\.md)?/g, '/me/ssr_subscription')
    if (updated !== content) {
      fs.writeFileSync(f, updated, 'utf8')
      console.log(`[links] updated ${f}`)
    }
  }
}

function main() {
  if (!fs.existsSync(src)) {
    console.error('Source RSS doc not found:', src)
    process.exit(1)
  }
  fs.renameSync(src, dest)
  console.log(`[move] ${src} -> ${dest}`)
  updateFrontmatter(dest)
  updateLinks()
  console.log('Move RSS to me completed.')
}

main()

