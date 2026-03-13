export interface HttpOptions {
  baseUrl?: string
  apiBasePath?: string
  fetcher?: typeof fetch
  csrfCookieName?: string
  csrfHeaderName?: string
  csrfToken?: string
  csrfTokenProvider?: () => string | undefined
}

export function createHttpClient(options: HttpOptions = {}) {
  const baseUrl = options.baseUrl || ''
  const apiBasePath = options.apiBasePath || '/api/changelog'
  const fetcher = options.fetcher || fetch
  const csrfCookieName = options.csrfCookieName || 'changelog-csrf'
  const csrfHeaderName = options.csrfHeaderName || 'x-csrf-token'

  const buildUrl = (path: string) => `${baseUrl}${apiBasePath}${path}`

  const readCookie = (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined
    const parts = document.cookie ? document.cookie.split(';') : []
    for (const part of parts) {
      const [rawName, ...rawValue] = part.trim().split('=')
      if (rawName === name) {
        return decodeURIComponent(rawValue.join('='))
      }
    }
    return undefined
  }

  const getCsrfToken = (): string | undefined => {
    if (options.csrfToken) return options.csrfToken
    if (options.csrfTokenProvider) return options.csrfTokenProvider()
    return readCookie(csrfCookieName)
  }

  const isStateChanging = (method?: string) => {
    const value = (method || 'GET').toUpperCase()
    return value === 'POST' || value === 'PUT' || value === 'PATCH' || value === 'DELETE'
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const method = init?.method
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else if (Array.isArray(init.headers)) {
        for (const [key, value] of init.headers) {
          headers[key] = value
        }
      } else {
        Object.assign(headers, init.headers as Record<string, string>)
      }
    }
    if (isStateChanging(method) && csrfHeaderName && !headers[csrfHeaderName]) {
      const token = getCsrfToken()
      if (token) {
        headers[csrfHeaderName] = token
      }
    }

    const response = await fetcher(buildUrl(path), {
      credentials: 'include',
      headers,
      ...init,
    })

    const text = await response.text()
    const payload = text ? JSON.parse(text) : null

    return payload as T
  }

  return { request }
}
