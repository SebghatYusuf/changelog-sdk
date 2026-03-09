export function normalizeSemver(version: string): string {
  return version.trim().replace(/^v/i, '')
}

export function parseSemver(version: string): [number, number, number] | null {
  const normalized = normalizeSemver(version)
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export function compareSemver(a: string, b: string): number {
  const parsedA = parseSemver(a)
  const parsedB = parseSemver(b)

  if (!parsedA || !parsedB) {
    throw new Error('Version must use semantic format (e.g. 1.2.3)')
  }

  for (let index = 0; index < 3; index++) {
    if (parsedA[index] > parsedB[index]) return 1
    if (parsedA[index] < parsedB[index]) return -1
  }

  return 0
}
