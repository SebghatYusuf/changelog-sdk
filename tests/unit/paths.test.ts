import { joinPath, normalizeBasePath, withQuery } from '../../lib/changelog-platform/runtime/paths'

describe('path helpers', () => {
  it('normalizes base path', () => {
    expect(normalizeBasePath('/updates/')).toBe('/updates')
    expect(normalizeBasePath('product/changelog')).toBe('/product/changelog')
  })

  it('joins path segments safely', () => {
    expect(joinPath('/updates', 'admin', 'edit', '123')).toBe('/updates/admin/edit/123')
  })

  it('builds query string', () => {
    expect(withQuery('/updates', { page: 2, search: 'hello', empty: '' })).toBe('/updates?page=2&search=hello')
  })
})

