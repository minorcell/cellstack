export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {children}
    </div>
  );
}
