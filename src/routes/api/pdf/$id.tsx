import { renderToBuffer } from '@react-pdf/renderer'
import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'

import { db } from '#/db'
import { application } from '#/db/schema'
import { auth } from '#/lib/auth'
import { CvDocument } from '#/lib/pdf/CvDocument'

const safeFilename = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

export const Route = createFileRoute('/api/pdf/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return new Response('Unauthorized', { status: 401 })
        }

        const row = await db.query.application.findFirst({
          where: and(
            eq(application.id, params.id),
            eq(application.userId, session.user.id),
          ),
        })
        if (!row) {
          return new Response('Not found', { status: 404 })
        }

        const buffer = await renderToBuffer(
          <CvDocument
            jobTitle={row.jobTitle}
            company={row.company}
            cv={row.tailoredCv}
          />,
        )

        return new Response(Uint8Array.from(buffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="cv-${safeFilename(row.company)}.pdf"`,
          },
        })
      },
    },
  },
})
