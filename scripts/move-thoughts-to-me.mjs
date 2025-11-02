import fs from 'fs'
import path from 'path'

const docs = path.resolve('docs')
const blog = path.join(docs, 'blog')
const me = path.join(docs, 'me')

const thoughts = [
  'industry_slang_my_thoughts.md',
  'technical_writer_choice_traffic_vs_value.md',
  'programming_evolution_instruction_to_intent_ai_era.md',
]

function move(src, destDir) {
  const base = path.basename(src)
  const dest = path.join(destDir, base)
  if (!fs.existsSync(src)) return null
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
  fs.renameSync(src, dest)
  return dest
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
  const moved = []
  for (const f of thoughts) {
    const src = path.join(blog, f)
    const dest = move(src, me)
    if (dest) {
      console.log(`[move] ${src} -> ${dest}`)
      const slug = f.replace(/\.md$/, '')
      moved.push({ from: `/blog/${slug}`, to: `/me/${slug}` })
    } else {
      console.warn(`[skip] not found: ${src}`)
    }
  }
  if (moved.length) updateLinks(moved)
  console.log('Moved thoughts to me completed.')
}

main()

