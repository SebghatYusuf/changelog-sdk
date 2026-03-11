function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function renderMarkdown(markdown: string): Promise<string> {
  if (typeof window === 'undefined') {
    return `<pre class="cl-markdown">${escapeHtml(markdown)}</pre>`
  }

  const { marked } = await import('marked')
  const dompurify = await import('dompurify')
  const DOMPurify = (dompurify as any).default || dompurify
  const html = marked.parse(markdown)
  return DOMPurify.sanitize(html)
}
