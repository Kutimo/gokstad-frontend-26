'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NoteForm() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const body = Object.fromEntries(new FormData(formEl))
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    })
    if (!res.ok) return setError('Could not save note')
    setError('')
    formEl.reset()
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <label>
        Title
        <input name="title" required />
      </label>
      <label>
        Content
        <textarea name="content" rows={3} />
      </label>
      {error && <p className="error">{error}</p>}
      <button>Add note</button>
    </form>
  )
}
