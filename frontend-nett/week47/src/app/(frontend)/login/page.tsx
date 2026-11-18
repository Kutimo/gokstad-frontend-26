import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import { getCurrentUser } from '@/lib/auth'

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/account')
  return (
    <>
      <h1>Log in</h1>
      <AuthForm mode="login" />
    </>
  )
}
