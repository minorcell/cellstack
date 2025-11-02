import fs from 'fs'
import path from 'path'

const docs = path.resolve('docs')
const blog = path.join(docs, 'blog')
const topicsRoot = path.join(docs, 'topics')

const map = {
  ai: [
    'agent_react_and_loop.md',
    'agent_is_llm_plus_tools.md',
    'what_is_agents_md.md',
    'misunderstanding_llm.md',
    'claude_code_sub_agent.md',
    'prompt_engineering_getting_started.md',
  ],
  client: [
    'add_rss_subscription_to_blog.md',
    'echarts_getting_started_guide.md',
    'gsap_scrolltrigger.md',
    'gsap_getting_started_guide.md',
    'javascript_multithreading_worker.md',
    'frontend_beginner_guide_2025.md',
    'javascript_event_loop.md',
    'javascript_async_guide_6_patterns.md',
    'vue_style_management_engineering_practice.md',
    'indexeddb_complete_guide.md',
    'vscode_eslint_plus_prettier.md',
  ],
  server: [
    'go_concurrency_sleep_to_select.md',
    'websocket.md',
    'hash_algorithm_complete_guide.md',
  ],
  network: [
    'http_status_codes_guide_15_core.md',
  ],
  ops: [
    'docker_advanced_guide.md',
    'docker_getting_started.md',
    'linux_command_line_50_core_tools.md',
    'project_configuration_management_best_practices.md',
  ],
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function move(src, dest) {
  ensureDir(path.dirname(dest))
  fs.renameSync(src, dest)
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
  for (const [topic, files] of Object.entries(map)) {
    const destDir = path.join(topicsRoot, topic)
    ensureDir(destDir)
    for (const fname of files) {
      const src = path.join(blog, fname)
      if (!fs.existsSync(src)) {
        console.warn(`[skip] not found: ${src}`)
        continue
      }
      const dest = path.join(destDir, fname)
      move(src, dest)
      console.log(`[move] ${src} -> ${dest}`)
      const slug = fname.replace(/\.md$/, '')
      replacements.push({ from: `/blog/${slug}`, to: `/topics/${topic}/${slug}` })
    }
  }
  if (replacements.length) updateLinks(replacements)
  console.log('Move-to-topics completed.')
}

main()

