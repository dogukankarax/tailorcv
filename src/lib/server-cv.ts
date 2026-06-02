import { db } from '#/db'
import { masterCv } from '#/db/schema'
import { auth } from '#/lib/auth'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const getMyCv = createServerFn().handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')
  const userId = session.user.id
  const row = await db.query.masterCv.findFirst({
    where: eq(masterCv.userId, userId),
  })

  return row ?? null
})

export const saveMyCv = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({ content: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { content } = data
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Unauthorized')

    const userId = session.user.id
    const rows = await db
      .insert(masterCv)
      .values({ userId, content })
      .onConflictDoUpdate({ target: masterCv.userId, set: { content } })
      .returning()

    const row = rows[0]
    if (!row) throw new Error('Failed to save master CV')
    return row
  })
