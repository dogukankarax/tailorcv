import Header from '#/components/Header'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { getSession } from '#/lib/server-auth'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { user: session.user }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}
