'use client'

import { useState } from 'react'
import { useChangelogApi } from '../../api/context'

/**
 * Delete Button Component
 */

interface DeleteButtonProps {
  id: string
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const api = useChangelogApi()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    const result = await api.deleteEntry(id)

    if (!result.success) {
      alert(`Error: ${result.error}`)
      setLoading(false)
      return
    }

    window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="cl-btn cl-btn-sm cl-btn-danger cl-btn-compact"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
