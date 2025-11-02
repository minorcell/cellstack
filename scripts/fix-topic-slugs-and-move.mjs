import fs from 'fs'
import path from 'path'

const docs = path.resolve('docs')
const blog = path.join(docs, 'blog')
const topicsRoot = path.join(docs, 'topics')

const plan = {
  'agents_md.md': { topic: 'ai', new: 'what_is_agents_md.md' },
  'docker-1.md': { topic: 'ops', new: 'docker_advanced_guide.md' },
  'docker.md': { topic: 'ops', new: 'docker_getting_started.md' },
  'echarts.md': { topic: 'client', new: 'echarts_getting_started_guide.md' },
  'go_sleep_select.md': { topic: 'server', new: 'go_concurrency_sleep_to_select.md' },
  'http_15.md': { topic: 'network', new: 'http_status_codes_guide_15_core.md' },
  'indexeddb.md': { topic: 'client', new: 'indexeddb_complete_guide.md' },
  'javascript_settimeout_6.md': { topic: 'client', new: 'javascript_async_guide_6_patterns.md' },
  'javascript_worker.md': { topic: 'client', new: 'javascript_multithreading_worker.md' },
  'linux_50.md': { topic: 'ops', new: 'linux_command_line_50_core_tools.md' },
  'prompt_engineering_ai.md': { topic: 'ai', new: 'prompt_engineering_getting_started.md' },
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function updateLinks(replacements) {
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
    for (const r of replacements) {
      const fromEsc = r.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const toRel = r.to.replace(/^\//, '')
      const absRe = new RegExp(`(${fromEsc})(\\.md)?(?=$|[\\)\\]\\s\"'#,|])`, 'g')
      updated = updated.replace(absRe, r.to)
      const relFrom = r.from.replace(/^\//, '')
      const relEsc = relFrom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const relRe = new RegExp(`(${relEsc})(\\.md)?(?=$|[\\)\\]\\s\"'#,|])`, 'g')
      updated = updated.replace(relRe, toRel)
    }
    if (updated !== content) {
      fs.writeFileSync(f, updated, 'utf8')
      console.log(`[links] updated ${f}`)
    }
  }
}

function main() {
  const replacements = []
  for (const [fname, { topic, new: newName }] of Object.entries(plan)) {
    const src = path.join(blog, fname)
    if (!fs.existsSync(src)) {
      console.warn(`[skip] not found: ${src}`)
      continue
    }
    const destDir = path.join(topicsRoot, topic)
    ensureDir(destDir)
    const dest = path.join(destDir, newName)
    fs.renameSync(src, dest)
    console.log(`[move] ${src} -> ${dest}`)
    const fromSlug = fname.replace(/\.md$/, '')
    const toSlug = newName.replace(/\.md$/, '')
    replacements.push({ from: `/blog/${fromSlug}`, to: `/topics/${topic}/${toSlug}` })
  }
  if (replacements.length) updateLinks(replacements)
  console.log('Fix-topic-slugs-and-move completed.')
}

main()

