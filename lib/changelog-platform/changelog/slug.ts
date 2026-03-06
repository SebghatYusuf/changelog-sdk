export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugWithSuffix(baseSlug: string, attempt: number): string {
  if (attempt <= 0) return baseSlug
  return `${baseSlug}-${attempt + 1}`
}

