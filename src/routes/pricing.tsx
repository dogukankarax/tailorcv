import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { PublicHeader } from '#/components/PublicHeader'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { authClient } from '#/lib/auth-client'
import { createCheckoutSession, getMyPlan } from '#/lib/server-stripe'

export const Route = createFileRoute('/pricing')({
  component: Pricing,
})

function Pricing() {
  const { data: session, isPending } = authClient.useSession()

  const mutation = useMutation({
    mutationFn: () => createCheckoutSession(),
    onSuccess: ({ url }) => {
      window.location.href = url
    },
  })
  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['plan'],
    queryFn: () => getMyPlan(),
    enabled: !!session?.user,
  })

  return (
    <>
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-center font-display text-4xl font-semibold">
          Pricing
        </h1>
        <p className="mt-3 text-center text-muted-foreground">
          Start free. Upgrade when you need more.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>$0 / month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>3 tailored CVs per day</li>
                <li>PDF export</li>
                <li>GitHub import</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>$7 / month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Unlimited tailored CVs</li>
                <li>Everything in Free</li>
              </ul>
            </CardContent>
            <CardFooter>
              {isPending ? (
                <Button className="w-full" disabled>
                  Loading…
                </Button>
              ) : !session?.user ? (
                <Button asChild className="w-full">
                  <Link to="/login">Sign in to upgrade</Link>
                </Button>
              ) : planLoading ? (
                <Button className="w-full" disabled>
                  Loading…
                </Button>
              ) : plan === 'pro' ? (
                <Button className="w-full" disabled>
                  Current plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate()}
                >
                  {mutation.isPending ? 'Redirecting...' : 'Upgrade to Pro'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}
