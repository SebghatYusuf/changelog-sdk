import { compareSemver, normalizeSemver, parseSemver } from '../../lib/changelog-platform/changelog/semver'

describe('semver helpers', () => {
  it('normalizes v-prefix', () => {
    expect(normalizeSemver('v1.2.3')).toBe('1.2.3')
  })

  it('parses valid semver and rejects invalid', () => {
    expect(parseSemver('1.2.3')).toEqual([1, 2, 3])
    expect(parseSemver('1.2')).toBeNull()
  })

  it('compares semver versions', () => {
    expect(compareSemver('1.2.4', '1.2.3')).toBe(1)
    expect(compareSemver('1.2.3', '1.2.3')).toBe(0)
    expect(compareSemver('1.2.2', '1.2.3')).toBe(-1)
  })
})

