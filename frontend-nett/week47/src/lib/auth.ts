import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

/** Returns the Payload instance (Local API) for use in server components. */
export const getPayloadClient = () => getPayload({ config })

/** Returns the logged-in user (or null) by reading the payload-token cookie. */
export async function getCurrentUser() {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user
}

/** Use at the top of a protected page: sends visitors to /login. */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}
