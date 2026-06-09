import { getRequest } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'

// Server-only helper for use inside server function handlers.
// Returns the authenticated user or throws Unauthorized.
export async function requireUser() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')
  return session.user
}
