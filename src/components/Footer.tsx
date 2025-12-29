'use client'

import { useEffect, useState } from 'react'

const phrase = 'GITHUB JUNJIN'
const firstLength = 'GITHUB'.length
const secondStart = firstLength + 1 // skip space

export function Footer() {
  const [charIndex, setCharIndex] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const typing = setInterval(() => {
      setCharIndex((idx) => Math.min(idx + 1, phrase.length))
    }, 110)

    const blink = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 650)

    return () => {
      clearInterval(typing)
      clearInterval(blink)
    }
  }, [])

  const typedFirst = phrase.slice(0, Math.min(charIndex, firstLength))
  const typedSecond =
    charIndex > secondStart
      ? phrase.slice(secondStart, Math.min(charIndex, phrase.length))
      : ''
  const showCursor = charIndex >= phrase.length

  return (
    <footer className="h-24 mt-auto flex items-center bg-white">
      <div className="max-w-7-xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-600 font-mono">
            © {new Date().getFullYear()} CELLSTACK
          </p>
          <div className="flex space-x-6 sm:space-x-8 text-xs sm:text-sm font-mono uppercase tracking-[0.2em] sm:tracking-[0.35em] text-gray-800 whitespace-nowrap">
            <a
              href="https://github.com/minorcell"
              className="hover:text-black transition-colors"
            >
              {typedFirst || '\u00A0'}
            </a>
            <div className="flex items-center">
              <a
                href="https://juejin.cn/user/2280829967146779"
                className="hover:text-black transition-colors"
              >
                {typedSecond || '\u00A0'}
              </a>
              <span
                className={`inline-block w-0.5 h-4 bg-black ml-1 align-middle ${
                  showCursor && cursorVisible ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
