import { db } from '#/db'
import { masterCv } from '#/db/schema'
import { requireUser } from '#/lib/require-user'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const getMyCv = createServerFn().handler(async () => {
  const currentUser = await requireUser()
  const userId = currentUser.id

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
    const currentUser = await requireUser()
    const userId = currentUser.id

    const rows = await db
      .insert(masterCv)
      .values({ userId, content })
      .onConflictDoUpdate({ target: masterCv.userId, set: { content } })
      .returning()

    const row = rows[0]
    if (!row) throw new Error('Failed to save master CV')
    return row
  })

export const appendToMasterCv = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) =>
    z
      .object({
        text: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const currentUser = await requireUser()
    const userId = currentUser.id

    const cv = await db.query.masterCv.findFirst({
      where: eq(masterCv.userId, userId),
    })

    const newContent = cv ? cv.content + '\n\n' + data.text : data.text

    const rows = await db
      .insert(masterCv)
      .values({ userId, content: newContent })
      .onConflictDoUpdate({
        target: masterCv.userId,
        set: { content: newContent },
      })
      .returning()

    const row = rows[0]
    if (!row) throw new Error('Failed to update master CV')
    return row
  })
