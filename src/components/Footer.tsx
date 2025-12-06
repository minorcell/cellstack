export function Footer() {
  return (
    <footer className="py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 font-mono">
            © {new Date().getFullYear()} CELLSTACK
          </p>
          <div className="flex space-x-8">
            <a href="https://github.com/minorcell" className="text-gray-500 hover:text-black transition-colors text-sm font-mono uppercase tracking-wider">
              GitHub
            </a>
            <a href="https://juejin.cn/user/2280829967146779" className="text-gray-500 hover:text-black transition-colors text-sm font-mono uppercase tracking-wider">
              Juejin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
