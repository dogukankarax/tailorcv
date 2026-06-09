import { Link } from '@tanstack/react-router'

import { ThemeToggle } from '#/components/ThemeToggle'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { authClient } from '#/lib/auth-client'

export function PublicHeader() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <header className="sticky top-4 z-40 mx-auto mt-4 max-w-5xl rounded-2xl border bg-background/70 shadow-sm backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">
        <Link to="/" className="font-display text-lg font-semibold">
          TailorCV
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="rounded-md px-3 py-1.5 text-sm transition-colors"
            activeProps={{ className: 'bg-accent text-foreground' }}
            inactiveProps={{
              className: 'text-muted-foreground hover:text-foreground',
            }}
          >
            Pricing
          </Link>
          <ThemeToggle />
          {isPending ? (
            <Skeleton className="h-8 w-32" />
          ) : session?.user ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm">
                <Link to="/register">Get started free</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
