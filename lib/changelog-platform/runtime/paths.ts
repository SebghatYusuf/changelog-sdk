export const DEFAULT_BASE_PATH = '/changelog'

export function normalizeBasePath(basePath?: string): string {
  const raw = (basePath || DEFAULT_BASE_PATH).trim()
  if (!raw) return DEFAULT_BASE_PATH

  const withLeading = raw.startsWith('/') ? raw : `/${raw}`
  const normalized = withLeading.replace(/\/+$/, '')
  return normalized || DEFAULT_BASE_PATH
}

export function joinPath(basePath: string, ...segments: Array<string | undefined>): string {
  const root = normalizeBasePath(basePath)
  const cleanSegments = segments
    .filter(Boolean)
    .map((segment) => String(segment).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)

  if (cleanSegments.length === 0) return root
  return `${root}/${cleanSegments.join('/')}`
}

export function withQuery(path: string, query: Record<string, string | number | boolean | undefined | null>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }

  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

