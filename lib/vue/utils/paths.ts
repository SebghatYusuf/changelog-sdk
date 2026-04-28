const DEFAULT_BASE_PATH = '/changelog'

export function normalizeBasePath(basePath?: string): string {
  const candidate = (basePath ?? DEFAULT_BASE_PATH).trim()
  if (!candidate) return DEFAULT_BASE_PATH

  const withLeadingSlash = candidate.startsWith('/') ? candidate : `/${candidate}`
  if (withLeadingSlash === '/') return '/'

  return withLeadingSlash.replace(/\/+$/, '')
}

export function buildChangelogPath(basePath: string | undefined, ...segments: Array<string | undefined>): string {
  const normalizedBasePath = normalizeBasePath(basePath)
  const cleanedSegments = segments
    .filter((segment): segment is string => Boolean(segment && segment.trim()))
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))

  if (normalizedBasePath === '/') {
    return cleanedSegments.length > 0 ? `/${cleanedSegments.join('/')}` : '/'
  }

  return cleanedSegments.length > 0
    ? `${normalizedBasePath}/${cleanedSegments.join('/')}`
    : normalizedBasePath
}

/**
 * Auto-detect basePath from current browser location by matching against known
 * changelog route segments. This helps when consumers forget to pass basePath
 * or when the app is mounted under an unexpected nested route.
 */
export function detectBasePath(fallback = DEFAULT_BASE_PATH): string {
  if (typeof window === 'undefined') return fallback

  const pathname = window.location.pathname
  const knownSegments = ['admin', 'login', 'register']

  // If pathname already ends with a known segment, derive basePath from it
  for (const segment of knownSegments) {
    const idx = pathname.indexOf(`/${segment}`)
    if (idx > 0) {
      return pathname.slice(0, idx) || fallback
    }
  }

  // If we're on a detail page (single slug after base), try to detect by
  // checking if the last segment looks like a slug and the parent exists
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 1) {
    // Heuristic: if the first part is not a known segment, treat the whole
    // pathname except the last segment as the basePath when we have 2+ parts
    if (parts.length >= 2 && !knownSegments.includes(parts[parts.length - 1])) {
      return '/' + parts.slice(0, -1).join('/')
    }
    // If only one part and it's a known segment, root is base
    if (parts.length === 1 && knownSegments.includes(parts[0])) {
      return '/'
    }
  }

  return fallback
}
