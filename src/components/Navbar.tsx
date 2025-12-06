'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Blog', href: '/blog' },
  { name: 'Me', href: '/me' },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const navBackground = isHome ? 'bg-transparent' : 'bg-white/70 backdrop-blur-md';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 py-1 ${navBackground}`}>
      <div className="max-w-[90vw] mx-auto px-6 sm:px-12 flex justify-between items-center h-16">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.svg"
              alt="CellStack logo"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
            <span className="text-xl font-bold tracking-tighter text-black group-hover:opacity-80 transition-opacity">
              CELLSTACK
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/minorcell/cellstack"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-all"
          >
            <Github className="h-4 w-4 mr-2" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
