import { PublicHeader } from '#/components/PublicHeader'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { authClient } from '#/lib/auth-client'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <>
      <PublicHeader />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-150 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]"
      />

      <section className="mx-auto max-w-3xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20 text-center">
        <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          Built from your real CV and GitHub
        </span>

        <h1 className="mt-6 font-display text-4xl sm:text-6xl font-semibold leading-[1.05] tracking-tight text-foreground">
          A CV that fits <span className="text-indigo-400">every job</span> you
          apply to
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Paste a job post and get a match score, your strengths and gaps, a
          reordered CV, and a cover letter — written only from what you actually
          did.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          {isPending ? (
            <>
              <Skeleton className="h-10 w-60" />
            </>
          ) : session?.user ? (
            <Button asChild size="lg">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/register">Get started free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Match score',
              body: 'A 0-100 score with the strengths that line up and the gaps to close.',
            },
            {
              title: 'Tailored CV & cover letter',
              body: 'Your experience reordered for the role, exported to a clean PDF.',
            },
            {
              title: 'Grounded in GitHub',
              body: 'Pull in your public repos so the CV reflects real work, not filler.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card/70 p-6 text-left"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
