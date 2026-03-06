export type WorkflowState = 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'published'

export interface WorkflowTransitionInput {
  current: WorkflowState
  next: WorkflowState
}

export interface WorkflowTransitionResult {
  status: 'draft' | 'published'
}

const TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  draft: ['pending_approval', 'scheduled', 'published'],
  pending_approval: ['approved', 'draft'],
  approved: ['scheduled', 'published', 'draft'],
  scheduled: ['published', 'draft'],
  published: ['draft'],
}

export function getWorkflowFromStatus(status: 'draft' | 'published', existing?: WorkflowState): WorkflowState {
  if (existing) return existing
  return status === 'published' ? 'published' : 'draft'
}

export function deriveStatusFromWorkflow(workflowState: WorkflowState): 'draft' | 'published' {
  return workflowState === 'published' ? 'published' : 'draft'
}

export function assertWorkflowTransition({ current, next }: WorkflowTransitionInput): WorkflowTransitionResult {
  if (!TRANSITIONS[current].includes(next)) {
    throw new Error(`Invalid workflow transition from "${current}" to "${next}"`)
  }

  return {
    status: deriveStatusFromWorkflow(next),
  }
}

