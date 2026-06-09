import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { authClient } from '#/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'

export function UserMenu() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  if (isPending)
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-20" />
      </div>
    )

  if (!session?.user) return null

  return (
    <div className="flex items-center gap-2">
      {session.user.image ? (
        <img
          src={session.user.image}
          alt=""
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <span className="text-xs font-medium text-muted-foreground">
            {session.user.name.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await authClient.signOut()
          void navigate({ to: '/' })
        }}
      >
        Sign out
      </Button>
    </div>
  )
}
