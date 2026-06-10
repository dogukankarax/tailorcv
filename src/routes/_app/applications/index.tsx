import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { getMyApplications } from '#/lib/server-applications'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/applications/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getMyApplications(),
  })
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold">Applications</h1>
        <Button asChild>
          <Link to="/applications/new">New application</Link>
        </Button>
      </div>
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      ) : data?.length === 0 ? (
        <p className="text-muted-foreground">
          No applications yet.{' '}
          <Link to="/applications/new" className="underline">
            Create your first one
          </Link>
        </p>
      ) : (
        <ul className="space-y-6">
          {data?.map((app) => (
            <li key={app.id}>
              <Link
                to="/applications/$id"
                params={{ id: app.id }}
                className="block"
              >
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{app.jobTitle}</CardTitle>
                    <CardDescription>{app.company}</CardDescription>
                    <CardAction>
                      <Badge>{app.matchScore}/100</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
