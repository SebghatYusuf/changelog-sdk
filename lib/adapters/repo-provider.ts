import type { RepoProviderPort } from '../core/ports'
import type { PersistedRepoSettings, RepoCommit, RepoCommitQuery } from '../core/types'

const DEFAULT_TIMEOUT_MS = 10000

function sanitizeCommitMessage(message: string): string {
  return message.replace(/[\u0000-\u001f\u007f]/g, '').trim()
}

function parseDateInput(value?: string): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const isoCandidate = trimmed.length <= 10 ? `${trimmed}T00:00:00.000Z` : trimmed
  const parsed = new Date(isoCandidate)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

async function fetchJson<T>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'User-Agent': 'changelog-sdk',
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Repository request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

function toGithubRepo(settings: PersistedRepoSettings): { owner: string; repo: string } {
  const parsed = new URL(settings.repoUrl)
  if (parsed.hostname !== 'github.com') {
    throw new Error('Git provider currently supports github.com URLs only')
  }

  const parts = parsed.pathname.replace(/\.git$/, '').split('/').filter(Boolean)
  if (parts.length < 2) {
    throw new Error('Repository URL must include owner and repository')
  }

  return { owner: parts[0], repo: parts[1] }
}

async function listGithubCommits(settings: PersistedRepoSettings, query: RepoCommitQuery): Promise<RepoCommit[]> {
  const { owner, repo } = toGithubRepo(settings)
  const since = parseDateInput(query.since)
  const until = parseDateInput(query.until)
  const limit = Math.min(200, Math.max(1, query.limit ?? 50))
  const pageSize = Math.min(100, limit)

  let page = 1
  const commits: RepoCommit[] = []

  while (commits.length < limit) {
    const apiUrl: URL = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`)
    apiUrl.searchParams.set('per_page', String(pageSize))
    apiUrl.searchParams.set('page', String(page))
    if (settings.branch) apiUrl.searchParams.set('sha', settings.branch)
    if (since) apiUrl.searchParams.set('since', since)
    if (until) apiUrl.searchParams.set('until', until)

    const data: any[] = await fetchJson<any[]>(apiUrl.toString(), settings.token)
    if (!data.length) break

    for (const item of data) {
      const message = sanitizeCommitMessage(String(item.commit?.message || ''))
      const isMerge = Array.isArray(item.parents) && item.parents.length > 1
      if (!query.includeMerges && (isMerge || message.toLowerCase().startsWith('merge'))) {
        continue
      }

      commits.push({
        id: String(item.sha),
        message,
        summary: message.split('\n')[0] || '',
        author: String(item.commit?.author?.name || ''),
        date: String(item.commit?.author?.date || ''),
        url: item.html_url ? String(item.html_url) : undefined,
      })

      if (commits.length >= limit) break
    }

    if (data.length < pageSize) break
    page += 1
  }

  return commits
}

async function listBitbucketCommits(settings: PersistedRepoSettings, query: RepoCommitQuery): Promise<RepoCommit[]> {
  const since = parseDateInput(query.since)
  const until = parseDateInput(query.until)
  const limit = Math.min(200, Math.max(1, query.limit ?? 50))
  const pageSize = Math.min(100, limit)

  let nextUrl: string | null = null
  const commits: RepoCommit[] = []

  do {
    const apiUrl: URL = nextUrl
      ? new URL(nextUrl)
      : new URL(
          `https://api.bitbucket.org/2.0/repositories/${settings.workspace}/${settings.repoSlug}/commits/${encodeURIComponent(settings.branch || 'main')}`
        )

    apiUrl.searchParams.set('pagelen', String(pageSize))
    if (since) apiUrl.searchParams.set('since', since)
    if (until) apiUrl.searchParams.set('until', until)

    const data: { values: any[]; next?: string } = await fetchJson<{ values: any[]; next?: string }>(
      apiUrl.toString(),
      settings.token
    )

    for (const item of data.values || []) {
      const message = sanitizeCommitMessage(String(item.message || ''))
      const isMerge = Array.isArray(item.parents) && item.parents.length > 1
      if (!query.includeMerges && (isMerge || message.toLowerCase().startsWith('merge'))) {
        continue
      }

      commits.push({
        id: String(item.hash || ''),
        message,
        summary: message.split('\n')[0] || '',
        author: String(item.author?.user?.display_name || item.author?.raw || ''),
        date: String(item.date || ''),
        url: item.links?.html?.href ? String(item.links.html.href) : undefined,
      })

      if (commits.length >= limit) break
    }

    if (commits.length >= limit) break
    nextUrl = data.next || null
  } while (nextUrl)

  return commits
}

export function createDefaultRepoProviderPort(): RepoProviderPort {
  return {
    async listCommits({ settings, query }) {
      if (settings.provider === 'bitbucket') {
        return listBitbucketCommits(settings, query)
      }

      return listGithubCommits(settings, query)
    },
  }
}
