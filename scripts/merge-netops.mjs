import fs from 'fs'
import path from 'path'

const docs = path.resolve('docs')
const networkDir = path.join(docs, 'topics', 'network')
const opsDir = path.join(docs, 'topics', 'ops')
const netopsDir = path.join(docs, 'topics', 'netops')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function moveAll(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return []
  ensureDir(destDir)
  const moved = []
  for (const f of fs.readdirSync(srcDir)) {
    if (!f.endsWith('.md')) continue
    if (f === 'index.md') continue
    const src = path.join(srcDir, f)
    const dest = path.join(destDir, f)
    fs.renameSync(src, dest)
    moved.push({ src, dest })
    console.log(`[move] ${src} -> ${dest}`)
  }
  return moved
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
  ensureDir(netopsDir)
  const movedNetwork = moveAll(networkDir, netopsDir)
  const movedOps = moveAll(opsDir, netopsDir)
  const replacements = []
  for (const m of movedNetwork) {
    const slug = path.parse(m.dest).name
    replacements.push({ from: `/topics/network/${slug}`, to: `/topics/netops/${slug}` })
  }
  for (const m of movedOps) {
    const slug = path.parse(m.dest).name
    replacements.push({ from: `/topics/ops/${slug}`, to: `/topics/netops/${slug}` })
  }
  if (replacements.length) updateLinks(replacements)
  // Create index.md for netops if missing
  const index = path.join(netopsDir, 'index.md')
  if (!fs.existsSync(index)) {
    const content = `---\n` +
      `title: 网络与运维专题\n` +
      `description: 合并网络与系统运维相关的文章集合。\n` +
      `---\n\n# 网络与运维专题\n\n网络协议、安全与系统运维（DevOps、容器、命令行、配置管理）相关的精选文章。\n`
    fs.writeFileSync(index, content, 'utf8')
    console.log(`[create] ${index}`)
  }
  console.log('Merge-netops completed.')
}

main()

