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