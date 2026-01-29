export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen pt-16 pb-20">{children}</div>
}
