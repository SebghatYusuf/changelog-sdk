'use client'

import { useState } from 'react'
import { generateChangelogPreviewLink, transitionChangelogWorkflow } from '../../actions/changelog-actions'
import { ChangelogEntry, WorkflowState } from '../../types/changelog'
import { useToast } from '../toast/provider'

interface WorkflowActionsProps {
  entry: ChangelogEntry
  basePath?: string
}

function nextTransitions(state: WorkflowState): WorkflowState[] {
  if (state === 'draft') return ['pending_approval', 'scheduled', 'published']
  if (state === 'pending_approval') return ['approved', 'draft']
  if (state === 'approved') return ['scheduled', 'published', 'draft']
  if (state === 'scheduled') return ['published', 'draft']
  return ['draft']
}

function buttonLabel(state: WorkflowState): string {
  if (state === 'pending_approval') return 'Submit'
  if (state === 'approved') return 'Approve'
  if (state === 'scheduled') return 'Schedule'
  if (state === 'published') return 'Publish'
  return 'Move to Draft'
}

export default function WorkflowActions({ entry, basePath = '/changelog' }: WorkflowActionsProps) {
  const { showToast } = useToast()
  const [loadingState, setLoadingState] = useState<WorkflowState | null>(null)
  const [previewBusy, setPreviewBusy] = useState(false)

  const transitions = nextTransitions(entry.workflowState || 'draft')

  const handleTransition = async (nextState: WorkflowState) => {
    setLoadingState(nextState)

    const scheduledAt =
      nextState === 'scheduled'
        ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
        : null

    const result = await transitionChangelogWorkflow(
      {
        id: entry._id,
        nextState,
        scheduledAt,
      },
      { basePath }
    )

    if (!result.success) {
      showToast(result.error || 'Workflow transition failed', 'error')
      setLoadingState(null)
      return
    }

    showToast(`Moved to ${nextState.replace('_', ' ')}.`, 'success')
    setLoadingState(null)
    window.location.reload()
  }

  const handlePreview = async () => {
    setPreviewBusy(true)
    const result = await generateChangelogPreviewLink({ id: entry._id }, { basePath })
    if (!result.success || !result.data) {
      showToast(result.error || 'Failed to create preview link', 'error')
      setPreviewBusy(false)
      return
    }

    try {
      await navigator.clipboard.writeText(result.data.url)
      showToast('Preview link copied to clipboard.', 'success')
    } catch {
      showToast(`Preview URL: ${result.data.url}`, 'success')
    }
    setPreviewBusy(false)
  }

  return (
    <>
      {transitions.map((state) => (
        <button
          key={state}
          type="button"
          disabled={loadingState !== null}
          onClick={() => handleTransition(state)}
          className="cl-btn cl-btn-sm cl-btn-secondary cl-btn-compact"
        >
          {loadingState === state ? 'Working...' : buttonLabel(state)}
        </button>
      ))}
      <button
        type="button"
        disabled={previewBusy}
        onClick={handlePreview}
        className="cl-btn cl-btn-sm cl-btn-secondary cl-btn-compact"
      >
        {previewBusy ? 'Generating...' : 'Preview URL'}
      </button>
    </>
  )
}
