'use client'

import { useState } from 'react'
import { useChangelogApi } from '../../api/context'

interface PublishButtonProps {
  id: string
}

export default function PublishButton({ id }: PublishButtonProps) {
  const api = useChangelogApi()
  const [loading, setLoading] = useState(false)

  const handlePublish = async () => {
    setLoading(true)

    const result = await api.updateEntry(id, { status: 'published' })

    if (!result.success) {
      alert(`Error: ${result.error}`)
      setLoading(false)
      return
    }

    window.dispatchEvent(new Event('changelog:refresh'))
    setLoading(false)
  }

  return (
    <button
      onClick={handlePublish}
      disabled={loading}
      className="cl-btn cl-btn-sm cl-btn-primary cl-btn-compact"
    >
      {loading ? 'Publishing...' : 'Publish'}
    </button>
  )
}
