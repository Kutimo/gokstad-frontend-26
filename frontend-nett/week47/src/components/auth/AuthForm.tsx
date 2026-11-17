'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = { mode: 'login' | 'register' }

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const body = Object.fromEntries(form) as Record<string, string>

    try {
      // Registering = creating a user. Payload does not log you in automatically.
      if (mode === 'register') {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.errors?.[0]?.message ?? 'Could not register')
        }
      }

      // Login sets the HTTP-only "payload-token" cookie for us.
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email, password: body.password }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.errors?.[0]?.message ?? 'Login failed')
      }

      router.push('/account')
      router.refresh() // re-run server components so the Header sees the new cookie
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="form">
      {mode === 'register' && (
        <label>
          Name
          <input name="name" type="text" autoComplete="name" />
        </label>
      )}
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={loading}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
    </form>
  )
}
