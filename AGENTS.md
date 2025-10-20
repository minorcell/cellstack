 # Repository Guidelines

 ## Project Structure & Module Organization
 - Source content lives in `docs/` with sections: `blog/`, `me/`, `transpond/`, and `public/`.
 - VitePress configuration and theme are under `docs/.vitepress/` (`config.mjs`, `theme/`, `cache/`, `dist/`).
 - Static assets live in repo `public/` and `docs/public/`.
 - Home page is `docs/index.md`; section indexes use `index.md` within each folder.

 ## Build, Test, and Development Commands
 - `npm ci`: install dependencies (Node 18+ recommended).
 - `npm run docs:dev`: start local dev server for live preview.
 - `npm run docs:build`: generate static site into `docs/.vitepress/dist/`.
 - `npm run docs:serve`: preview the built output locally.

 ## Coding Style & Naming Conventions
 - Markdown: ATX headings (`#`, `##`), sentence‑case titles, concise paragraphs.
 - Files: kebab‑case slugs (e.g., `docs/blog/2025/25_rss.md`). One article per file.
 - Links: prefer absolute site paths (`/blog/...`) or relative to the doc; verify in dev.
 - JS/Config: ES modules in `config.mjs`; 2‑space indent; keep config changes minimal and consistent.

 ## Testing Guidelines
 - Verify pages and navigation via `docs:dev`; then confirm production build with `docs:build`.
 - Check sidebar/nav entries in `docs/.vitepress/config.mjs` render and link correctly.
 - Ensure images resolve from `docs/public/` or root `public/`; confirm RSS output `feed.xml` exists.

 ## Commit & Pull Request Guidelines
 - Commits: present tense, scoped prefixes (e.g., `docs(blog): add RSS guide`).
 - PRs: include clear description, affected paths, screenshots for UI changes, and link issues.
 - Update nav/sidebar when adding/renaming articles; keep diffs focused.

 ## Security & Configuration Tips
 - Do not commit secrets; this is a static site.
 - Validate external scripts and links; prefer local assets.
 - Keep `editLink` `pattern` accurate for GitHub editing URLs.
