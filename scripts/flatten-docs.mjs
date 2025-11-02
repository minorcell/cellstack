import fs from 'fs'
import path from 'path'

const docsRoot = path.resolve('docs')

function isMarkdown(file) {
  return file.endsWith('.md')
}

function stripLeadingNumberSlug(name) {
  // Remove leading digits + underscore, e.g. 16_slang -> slang
  return name.replace(/^\d+_/, '')
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function moveWithConflictAvoid(src, dest) {
  let target = dest
  const { dir, name, ext } = path.parse(dest)
  let i = 1
  while (fs.existsSync(target)) {
    // Avoid overwriting; append numeric suffix
    target = path.join(dir, `${name}-${i}${ext}`)
    i++
  }
  fs.renameSync(src, target)
  return target
}

function flattenBlog() {
  const blogDir = path.join(docsRoot, 'blog')
  if (!fs.existsSync(blogDir)) return

  const yearDirs = fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^\d{4}$/.test(d.name))
    .map(d => path.join(blogDir, d.name))

  for (const yDir of yearDirs) {
    const files = fs.readdirSync(yDir)
    for (const f of files) {
      if (!isMarkdown(f)) continue
      if (f === 'index.md') continue

      const base = path.parse(f).name
      const clean = stripLeadingNumberSlug(base)
      const src = path.join(yDir, f)
      const dest = path.join(blogDir, `${clean}.md`)
      const final = moveWithConflictAvoid(src, dest)
      console.log(`[blog] ${src} -> ${final}`)
    }
    // remove year dir if empty
    const remains = fs.readdirSync(yDir)
    if (remains.length === 0) fs.rmdirSync(yDir)
  }
}

function flattenSection(section) {
  const secDir = path.join(docsRoot, section)
  if (!fs.existsSync(secDir)) return
  const files = fs.readdirSync(secDir)
  for (const f of files) {
    if (!isMarkdown(f)) continue
    if (f === 'index.md') continue
    const base = path.parse(f).name
    const clean = stripLeadingNumberSlug(base)
    if (clean === base) continue // nothing to do
    const src = path.join(secDir, f)
    const dest = path.join(secDir, `${clean}.md`)
    const final = moveWithConflictAvoid(src, dest)
    console.log(`[${section}] ${src} -> ${final}`)
  }
}

function replaceLinksInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let updated = content

  // Replace absolute blog links: /blog/2025/16_slang -> /blog/slang
  updated = updated.replace(/\/blog\/(\d{4})\/(\d+)_([A-Za-z0-9_-]+)/g, '/blog/$3')
  // Replace absolute blog links without number (unlikely): /blog/2025/slug -> /blog/slug
  updated = updated.replace(/\/blog\/(\d{4})\/([A-Za-z0-9_-]+)/g, '/blog/$2')

  // Replace section links: /me/01_write -> /me/write
  updated = updated.replace(/\/me\/\d+_([A-Za-z0-9_-]+)/g, '/me/$1')
  updated = updated.replace(/\/transpond\/\d+_([A-Za-z0-9_-]+)/g, '/transpond/$1')

  // Replace relative blog links: blog/2025/16_slang -> blog/slang
  updated = updated.replace(/(?<![A-Za-z0-9_])blog\/(\d{4})\/(\d+)_([A-Za-z0-9_-]+)/g, 'blog/$3')
  updated = updated.replace(/(?<![A-Za-z0-9_])blog\/(\d{4})\/([A-Za-z0-9_-]+)/g, 'blog/$2')

  // Replace relative section links: me/01_write -> me/write, transpond/02_tech -> transpond/tech
  updated = updated.replace(/(?<![A-Za-z0-9_])me\/\d+_([A-Za-z0-9_-]+)/g, 'me/$1')
  updated = updated.replace(/(?<![A-Za-z0-9_])transpond\/\d+_([A-Za-z0-9_-]+)/g, 'transpond/$1')

  // Drop .md suffixes for internal absolute links
  updated = updated.replace(/\/(blog|me|transpond)\/([A-Za-z0-9_-]+)\.md\b/g, '/$1/$2')
  // Drop .md suffixes for internal relative links
  updated = updated.replace(/(?<![A-Za-z0-9_])(blog|me|transpond)\/([A-Za-z0-9_-]+)\.md\b/g, '$1/$2')

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8')
    console.log(`[links] updated ${filePath}`)
  }
}

function updateLinks() {
  // Update links in markdown and vitepress config under docs
  const targets = []
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (p.endsWith('.md') || p.endsWith('.mjs')) targets.push(p)
    }
  }
  walk(docsRoot)
  for (const f of targets) replaceLinksInFile(f)
}

function main() {
  flattenBlog()
  flattenSection('me')
  flattenSection('transpond')
  updateLinks()
  console.log('Flatten completed.')
}

main()
