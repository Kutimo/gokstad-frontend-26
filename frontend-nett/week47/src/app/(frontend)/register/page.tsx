import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import { getCurrentUser } from '@/lib/auth'

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect('/account')
  return (
    <>
      <h1>Create account</h1>
      <AuthForm mode="register" />
    </>
  )
}
