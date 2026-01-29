'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
  showCursor?: boolean
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
  showCursor = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const startTyping = useCallback(() => {
    setIsTyping(true)
    let currentIndex = 0

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
        
        // Random speed variation for more natural feel
        const randomSpeed = speed + Math.random() * 30 - 15
        setTimeout(typeNextChar, randomSpeed)
      } else {
        setIsTyping(false)
        setIsComplete(true)
        onComplete?.()
      }
    }

    typeNextChar()
  }, [text, speed, onComplete])

  useEffect(() => {
    const timeout = setTimeout(startTyping, delay)
    return () => clearTimeout(timeout)
  }, [startTyping, delay])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (isTyping || !isComplete) && (
        <motion.span
          className="inline-block w-[8px] h-[1.2em] bg-[var(--pixel-cyan)] ml-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </span>
  )
}

// Multi-line typewriter for paragraphs
interface MultiLineTypewriterProps {
  lines: string[]
  speed?: number
  lineDelay?: number
  className?: string
  lineClassName?: string
  onComplete?: () => void
}

export function MultiLineTypewriter({
  lines,
  speed = 40,
  lineDelay = 500,
  className = '',
  lineClassName = '',
  onComplete,
}: MultiLineTypewriterProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [completedLines, setCompletedLines] = useState<string[]>([])

  const handleLineComplete = useCallback(() => {
    if (currentLineIndex < lines.length - 1) {
      setCompletedLines((prev) => [...prev, lines[currentLineIndex]])
      setCurrentLineIndex((prev) => prev + 1)
    } else {
      setCompletedLines((prev) => [...prev, lines[currentLineIndex]])
      onComplete?.()
    }
  }, [currentLineIndex, lines, onComplete])

  return (
    <div className={className}>
      {completedLines.map((line, index) => (
        <div key={index} className={lineClassName}>
          {line}
        </div>
      ))}
      {currentLineIndex < lines.length && (
        <div className={lineClassName}>
          <TypewriterText
            text={lines[currentLineIndex]}
            speed={speed}
            onComplete={handleLineComplete}
            showCursor={currentLineIndex === lines.length - 1}
          />
        </div>
      )}
    </div>
  )
}

// Glitch text effect for titles
interface GlitchTextProps {
  text: string
  className?: string
}

export function GlitchText({ text, className = '' }: GlitchTextProps) {
  return (
    <span
      className={`relative inline-block ${className}`}
      data-text={text}
      style={{
        textShadow: `
          2px 0 var(--pixel-cyan),
          -2px 0 var(--pixel-pink)
        `,
      }}
    >
      {text}
    </span>
  )
}

// Pulsing pixel text
interface PulsingTextProps {
  text: string
  className?: string
  colors?: string[]
}

export function PulsingText({
  text,
  className = '',
  colors = ['var(--pixel-cyan)', 'var(--pixel-purple)', 'var(--pixel-pink)'],
}: PulsingTextProps) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{
        color: colors,
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  )
}
