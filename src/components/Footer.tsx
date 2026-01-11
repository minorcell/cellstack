const links = [
  { label: 'GitHub', href: 'https://github.com/minorcell' },
  { label: 'Email', href: 'mailto:minorcell6789@gmail.com' },
  { label: 'RSS', href: '/feed.xml' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/70 bg-background/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">CellStack</p>
          <p className="text-xs text-muted-foreground">
            写代码，也写点生活与想法。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>© {year}</span>
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={
                item.href.startsWith('http') ? 'noopener noreferrer' : undefined
              }
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
