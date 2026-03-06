import { assertWorkflowTransition, deriveStatusFromWorkflow, getWorkflowFromStatus } from '../../lib/changelog-platform/changelog/workflow'

describe('workflow transitions', () => {
  it('derives published status correctly', () => {
    expect(deriveStatusFromWorkflow('published')).toBe('published')
    expect(deriveStatusFromWorkflow('approved')).toBe('draft')
  })

  it('maps legacy status to workflow state', () => {
    expect(getWorkflowFromStatus('draft')).toBe('draft')
    expect(getWorkflowFromStatus('published')).toBe('published')
  })

  it('allows valid transitions and rejects invalid transitions', () => {
    expect(assertWorkflowTransition({ current: 'draft', next: 'pending_approval' }).status).toBe('draft')
    expect(() => assertWorkflowTransition({ current: 'published', next: 'approved' })).toThrowError(
      /Invalid workflow transition/
    )
  })
})

