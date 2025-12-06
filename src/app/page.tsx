'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';

const ThreeBackground = dynamic(
  () => import('@/components/ThreeBackground').then((mod) => mod.ThreeBackground),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      <ThreeBackground />
      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-6xl sm:text-9xl font-bold tracking-tighter mb-6 text-black animate-fade-in">
          CELLSTACK
        </h1>
        
        <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-light tracking-wide animate-fade-in" style={{ animationDelay: '0.2s' }}>
          ENGINEERING · DESIGN · INTELLIGENCE
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-all hover:scale-105"
          >
            Read Blog
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
