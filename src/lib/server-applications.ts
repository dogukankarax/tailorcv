import { db } from '#/db'
import { application } from '#/db/schema'
import { auth } from '#/lib/auth'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

export const getMyApplications = createServerFn().handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')
  const userId = session.user.id
  const rows = await db.query.application.findMany({
    where: eq(application.userId, userId),
    orderBy: [desc(application.createdAt)],
  })

  return rows
})

const inputSchema = z.object({
  id: z.string(),
})

export const getApplicationById = createServerFn({
  method: 'GET',
})
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Unauthorized')
    const userId = session.user.id

    const row = await db.query.application.findFirst({
      where: and(eq(application.id, data.id), eq(application.userId, userId)),
    })

    if (!row) throw new Error('Application not found')
    return row
  })
