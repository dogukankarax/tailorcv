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

      <section className="mx-auto max-w-3xl px-6 pt-28 pb-20 text-center">
        <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          AI-powered CV tailoring
        </span>

        <h1 className="mt-6 font-display text-6xl font-semibold leading-[1.05] tracking-tight text-foreground">
          Tailor your CV to <span className="text-indigo-400">any job</span> in
          seconds
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Paste a job description and get a match score, a reordered CV, and a
          cover letter — grounded in your real GitHub projects.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
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

      <section className="mx-auto max-w-4xl px-6 pb-28">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Match score',
              body: 'See how well you fit, with strengths and gaps surfaced instantly.',
            },
            {
              title: 'Tailored output',
              body: 'A reordered CV and cover letter, exported to a clean PDF.',
            },
            {
              title: 'GitHub-powered',
              body: 'Turn your real repositories into polished CV bullet points.',
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
