'use client'

import { useRouter } from 'next/navigation'

export default function DeleteNoteButton({ id }: { id: number }) {
  const router = useRouter()

  async function remove() {
    await fetch(`/api/notes/${id}`, { method: 'DELETE', credentials: 'include' })
    router.refresh()
  }

  return <button onClick={remove}>Delete</button>
}
