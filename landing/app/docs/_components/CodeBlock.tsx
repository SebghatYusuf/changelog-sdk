'use client'

import { useState } from 'react'

const KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'async', 'await', 'import', 'from', 'export', 'default',
  'type', 'interface', 'extends', 'implements', 'new', 'class', 'if', 'else', 'for', 'while', 'switch',
  'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'typeof', 'in', 'of',
]

const TOKEN_REGEX = new RegExp(
  [
    '(?<comment>//.*?$|/\\*[\\s\\S]*?\\*/)',
    '(?<string>`(?:\\\\.|[^`])*`|\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*")',
    '(?<number>\\b\\d+(?:\\.\\d+)?\\b)',
    `(?<keyword>\\b(?:${KEYWORDS.join('|')})\\b)`,
  ].join('|'),
  'gm',
)

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function highlight(code: string) {
  let out = ''
  let lastIndex = 0
  for (const match of code.matchAll(TOKEN_REGEX)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      out += escapeHtml(code.slice(lastIndex, index))
    }
    const text = escapeHtml(match[0])
    if (match.groups?.comment) out += `<span class="tok-cmt">${text}</span>`
    else if (match.groups?.string) out += `<span class="tok-str">${text}</span>`
    else if (match.groups?.number) out += `<span class="tok-num">${text}</span>`
    else if (match.groups?.keyword) out += `<span class="tok-kw">${text}</span>`
    else out += text
    lastIndex = index + match[0].length
  }
  if (lastIndex < code.length) out += escapeHtml(code.slice(lastIndex))
  return out
}

export function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false)
  const highlighted = highlight(code)

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="code-window" style={{ margin: '1.25rem 0' }}>
      {filename && (
        <div className="code-window-header">
          <div className="code-dots">
            <div className="code-dot dot-red" />
            <div className="code-dot dot-yellow" />
            <div className="code-dot dot-green" />
          </div>
          <div className="code-file">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {filename}
          </div>
          <button
            onClick={copy}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? 'var(--primary)' : 'var(--text-dim)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <div className="code-body">
        <pre
          style={{ margin: 0, color: 'var(--text-muted)', whiteSpace: 'pre', overflowX: 'auto' }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  )
}
