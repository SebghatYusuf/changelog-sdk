const TRIVIAL_ROOT_SEGMENTS = new Set(['', 'index.html', 'assets'])

function detectBasePathname(pathname: string): string {
  const clean = pathname.split('?')[0].split('#')[0]
  const segments = clean.split('/').filter(Boolean)
  const first = segments[0] ?? ''

  if (TRIVIAL_ROOT_SEGMENTS.has(first)) {
    return '/'
  }

  return `/${first}/`
}

export function getSiteBasePath(): string {
  if (typeof window === 'undefined') {
    return '/'
  }

  return detectBasePathname(window.location.pathname)
}

export function toSitePath(path: string): string {
  const base = getSiteBasePath().replace(/\/+$/, '/')
  let clean = path.replace(/^\/+/, '')

  if (base.endsWith('/docs/') && (clean === 'docs' || clean.startsWith('docs/'))) {
    clean = clean === 'docs' ? '' : clean.slice('docs/'.length)
  }

  return `${base}${clean}`
}
