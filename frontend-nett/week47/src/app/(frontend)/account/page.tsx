import { requireUser } from '@/lib/auth'

export default async function AccountPage() {
  const user = await requireUser() // not logged in -> redirected to /login

  return (
    <>
      <h1>Your account</h1>
      <ul>
        <li>Email: {user.email}</li>
        <li>Name: {user.name || '(not set)'}</li>
        <li>Role: {user.role}</li>
      </ul>
      {user.role === 'admin' && <p><a href="/admin">Open the admin panel</a></p>}
    </>
  )
}
