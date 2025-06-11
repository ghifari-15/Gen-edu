"use client"

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
  isDark?: boolean
}

interface CodeBlockProps {
  node?: any
  inline?: boolean
  className?: string
  children?: React.ReactNode
  isDark?: boolean
  [key: string]: any
}

function CodeBlock({ node, inline, className, children = '', isDark, ...props }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const code = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  if (inline) {
    return (
      <code 
        className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono border"
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg border-b border-gray-700">
        <span className="text-sm font-medium">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={isDark ? vscDarkPlus : vs}
        language={language}
        PreTag="div"
        className="!mt-0 !rounded-t-none !rounded-b-lg"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export function MarkdownRenderer({ content, className = '', isDark = false }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          // Code blocks and inline code
          code: (props) => <CodeBlock {...props} isDark={isDark} />,
          
          // Headers
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium mb-2 text-gray-900">
              {children}
            </h4>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3 text-gray-800 leading-relaxed">
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-gray-800">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-800">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800">
              {children}
            </li>
          ),
          
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              {children}
            </a>
          ),
          
          // Emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800">
              {children}
            </em>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 italic text-gray-700 bg-gray-50 py-2">
              {children}
            </blockquote>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-800">
              {children}
            </td>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-t border-gray-200" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
