import { db } from '#/db'
import { application } from '#/db/schema'
import { requireUser } from '#/lib/require-user'
import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

export const getMyApplications = createServerFn().handler(async () => {
  const currentUser = await requireUser()
  const userId = currentUser.id
  const rows = await db.query.application.findMany({
    where: eq(application.userId, userId),
    orderBy: [desc(application.createdAt)],
  })

  return rows
})

const idInputSchema = z.object({
  id: z.string(),
})

export const getApplicationById = createServerFn({
  method: 'GET',
})
  .inputValidator((data: unknown) => idInputSchema.parse(data))
  .handler(async ({ data }) => {
    const currentUser = await requireUser()
    const userId = currentUser.id

    const row = await db.query.application.findFirst({
      where: and(eq(application.id, data.id), eq(application.userId, userId)),
    })

    if (!row) throw new Error('Application not found')
    return row
  })

export const deleteApplication = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => idInputSchema.parse(data))
  .handler(async ({ data }) => {
    const currentUser = await requireUser()
    const userId = currentUser.id

    await db
      .delete(application)
      .where(and(eq(application.id, data.id), eq(application.userId, userId)))
      .returning()

    return { success: true }
  })
