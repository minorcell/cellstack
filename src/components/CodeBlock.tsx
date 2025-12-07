'use client'

import React, { useState, type ReactNode, type CSSProperties } from 'react'
import { Copy } from 'lucide-react'

type CodeBlockProps = {
  children?: React.ReactNode
}

type SafeElement = React.ReactElement<{
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}>

function isElement(node: ReactNode): node is SafeElement {
  return React.isValidElement(node)
}

export function CodeBlock({ children }: CodeBlockProps) {
  const child =
    (React.Children.toArray(children)[0] as ReactNode | undefined) ?? null

  const extractText = (node: React.ReactNode): string => {
    if (node === null || node === undefined || typeof node === 'boolean')
      return ''
    if (typeof node === 'string' || typeof node === 'number')
      return String(node)
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (isElement(node)) return extractText(node.props?.children)
    return ''
  }

  const deriveCodeMeta = () => {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return { codeText: '', language: 'text', className: '' }
    }

    if (typeof child === 'string' || typeof child === 'number') {
      return { codeText: String(child), language: 'text', className: '' }
    }

    if (!isElement(child)) {
      return { codeText: extractText(child), language: 'text', className: '' }
    }

    const rawCode = child.props?.children
    const text = extractText(rawCode)

    const resolvedClassName = child.props?.className ?? ''
    const match = resolvedClassName.match(/language-([a-z0-9#+-]+)/i)
    const lang = match?.[1] ?? 'text'

    return {
      codeText: text.trimEnd(),
      language: lang,
      className: resolvedClassName,
    }
  }

  const { codeText, language, className } = deriveCodeMeta()

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!codeText) return
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  return (
    <div className="code-window my-8 overflow-hidden rounded-xl border border-gray-200/60 bg-[#0b0d11] shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f1116] border-b border-white/5">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#ff5f57]"
            aria-hidden="true"
          />
          <span
            className="h-3 w-3 rounded-full bg-[#febb2e]"
            aria-hidden="true"
          />
          <span
            className="h-3 w-3 rounded-full bg-[#28c840]"
            aria-hidden="true"
          />
          <span className="ml-3 text-xs font-medium uppercase tracking-wide text-gray-300">
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-200 hover:bg-white/5 active:scale-[0.99] transition"
          aria-label="Copy code"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-auto text-[13px] leading-relaxed text-gray-100 bg-[#0b0d11] font-mono m-0 p-0">
        <div className="p-4 sm:p-5 md:p-6 min-w-full">
          {isElement(child) ? (
            React.cloneElement(child, {
              className:
                `${className} block bg-transparent p-0 m-0 whitespace-pre`.trim(),
              style: {
                ...(child.props?.style || {}),
                background: 'transparent',
              },
            })
          ) : (
            <code
              className={`${className} block bg-transparent p-0 m-0 whitespace-pre`.trim()}
            >
              {extractText(child)}
            </code>
          )}
        </div>
      </pre>
    </div>
  )
}
