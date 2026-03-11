export interface HttpOptions {
  baseUrl?: string
  apiBasePath?: string
  fetcher?: typeof fetch
}

export function createHttpClient(options: HttpOptions = {}) {
  const baseUrl = options.baseUrl || ''
  const apiBasePath = options.apiBasePath || '/api/changelog'
  const fetcher = options.fetcher || fetch

  const buildUrl = (path: string) => `${baseUrl}${apiBasePath}${path}`

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetcher(buildUrl(path), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    })

    const text = await response.text()
    const payload = text ? JSON.parse(text) : null

    return payload as T
  }

  return { request }
}
