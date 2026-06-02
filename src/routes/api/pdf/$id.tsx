import { renderToBuffer } from '@react-pdf/renderer'
import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'

import { db } from '#/db'
import { application } from '#/db/schema'
import { auth } from '#/lib/auth'
import { CvDocument } from '#/lib/pdf/CvDocument'

export const Route = createFileRoute('/api/pdf/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // Auth check
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return new Response('Unauthorized', { status: 401 })
        }

        // Fetch application (owner-scoped)
        const row = await db.query.application.findFirst({
          where: and(
            eq(application.id, params.id),
            eq(application.userId, session.user.id),
          ),
        })
        if (!row) {
          return new Response('Not found', { status: 404 })
        }

        // Render PDF to buffer
        const buffer = await renderToBuffer(
          <CvDocument
            jobTitle={row.jobTitle}
            company={row.company}
            cv={row.tailoredCv}
          />,
        )

        // Return as downloadable file
        return new Response(Uint8Array.from(buffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="cv-${row.company}.pdf"`,
          },
        })
      },
    },
  },
})
