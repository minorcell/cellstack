import fs from 'fs'
import path from 'path'

const docsRoot = path.resolve('docs')
const sections = ['blog', 'me', 'transpond']

// Manual slug translations by current filename (without .md)
const manualMap = {
  // Chinese titles → concise English underscore slugs
  agents_md: 'what_is_agents_md',
  codeinfeature: 'programming_evolution_instruction_to_intent_ai_era',
  echarts: 'echarts_getting_started_guide',
  frontendlearn: 'frontend_beginner_guide_2025',
  gsap01: 'gsap_getting_started_guide',
  hash: 'hash_algorithm_complete_guide',
  llm01: 'misunderstanding_llm',
  projectconfig: 'project_configuration_management_best_practices',
  rss: 'add_rss_subscription_to_blog',
  slang: 'industry_slang_my_thoughts',
  vuestyle: 'vue_style_management_engineering_practice',
  whywrite: 'technical_writer_choice_traffic_vs_value',
  indexeddb: 'indexeddb_complete_guide',
  http_15: 'http_status_codes_guide_15_core',
  linux_50: 'linux_command_line_50_core_tools',
  javascript_settimeout_6: 'javascript_async_guide_6_patterns',
  javascript_worker: 'javascript_multithreading_worker',
  docker: 'docker_getting_started',
  'docker-1': 'docker_advanced_guide',
  go_sleep_select: 'go_concurrency_sleep_to_select',
  prompt_engineering_ai: 'prompt_engineering_getting_started',
  // me section
  write: 'technical_writing_single_line_structure',
  videoembed: 'video_embed_vue_component',
  musicembed: 'music_embed_spotify_component',
  // transpond section
  tech: 'curated_technical_tutorials_collection',
  write: 'curated_writing_tips_collection',
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readFrontmatterTitle(md) {
  const fmMatch = md.match(/^---[\s\S]*?---/)
  if (fmMatch) {
    const block = fmMatch[0]
    const tMatch = block.match(/\btitle:\s*(.+)/)
    if (tMatch) return tMatch[1].trim()
  }
  const h1 = md.match(/^#\s+(.+)/m)
  return h1 ? h1[1].trim() : null
}

function normalizeSymbolWords(s) {
  return s
    .replace(/=/g, ' is ')
    .replace(/\+/g, ' plus ')
    .replace(/&/g, ' and ')
    .replace(/\//g, ' or ')
    .replace(/:/g, ' ')
    .replace(/–|—/g, ' ')
    .replace(/"|“|”|‘|’|\(|\)|\[|\]|\{|\}|,/g, ' ')
}

function toUnderscoreSlug(title) {
  if (!title) return null
  let s = normalizeSymbolWords(title)
  // Keep ASCII letters and digits; split on non-ASCII
  const tokens = s
    .toLowerCase()
    .match(/[a-z0-9]+/g) || []
  if (tokens.length === 0) return null
  const slug = tokens.join('_')
  return slug.replace(/_+/g, '_')
}

function moveWithConflictAvoid(src, dest) {
  let target = dest
  const { dir, name, ext } = path.parse(dest)
  let i = 1
  while (fs.existsSync(target)) {
    if (fs.realpathSync(src) === fs.realpathSync(target)) return target
    target = path.join(dir, `${name}-${i}${ext}`)
    i++
  }
  fs.renameSync(src, target)
  return target
}

function updateLinksMap(replacements) {
  // replacements: array of {from:'/blog/old', to:'/blog/new'} and relative variants
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
  for (const f of targets) {
    const content = fs.readFileSync(f, 'utf8')
    let updated = content
    for (const r of replacements) {
      const fromEsc = r.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const toRel = r.to.replace(/^\//, '')
      // Absolute path segment replace: ensure end-of-segment
      const absRe = new RegExp(`(${fromEsc})(\\.md)?(?=$|[\\)\\]\\s\"'#,|])`, 'g')
      updated = updated.replace(absRe, r.to)
      // Relative path segment replace
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

function processSection(section) {
  const dir = path.join(docsRoot, section)
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'index.md')
  const replacements = []
  for (const f of files) {
    const p = path.join(dir, f)
    const content = fs.readFileSync(p, 'utf8')
    const title = readFrontmatterTitle(content)
    const oldSlug = path.parse(f).name
    const newSlug = manualMap[oldSlug] || toUnderscoreSlug(title)
    // Only rename if we have a reasonable slug and it's different
    if (newSlug && newSlug.length >= 5 && newSlug !== oldSlug) {
      const dest = path.join(dir, `${newSlug}.md`)
      const final = moveWithConflictAvoid(p, dest)
      console.log(`[rename] ${section}: ${oldSlug}.md -> ${path.basename(final)}`)
      const from = `/${section}/${oldSlug}`
      const to = `/${section}/${path.parse(final).name}`
      replacements.push({ from, to })
    } else {
      console.log(`[skip] ${section}: ${oldSlug}.md (title: ${title || 'N/A'})`)
    }
  }
  if (replacements.length) updateLinksMap(replacements)
}

function main() {
  for (const s of sections) processSection(s)
  console.log('Rename-by-title completed.')
}

main()
