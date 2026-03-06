'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateChangelog } from '../../actions/changelog-actions'

interface PublishButtonProps {
  id: string
}

export default function PublishButton({ id }: PublishButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePublish = async () => {
    setLoading(true)

    const result = await updateChangelog({
      id,
      status: 'published',
    })

    if (!result.success) {
      alert(`Error: ${result.error}`)
      setLoading(false)
      return
    }

    router.refresh()
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