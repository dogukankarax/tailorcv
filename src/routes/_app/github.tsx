import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Skeleton } from '#/components/ui/skeleton'
import { Textarea } from '#/components/ui/textarea'

import { appendToMasterCv } from '#/lib/server-cv'
import type { GithubRepo } from '#/lib/server-github'
import { generateProjectsFromRepos, getGithubRepos } from '#/lib/server-github'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/github')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [generatedText, setGeneratedText] = useState('')
  const [username, setUsername] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    )

  const mutation = useMutation({
    mutationFn: (githubUsername: string) =>
      getGithubRepos({ data: { username: githubUsername } }),
  })

  const generateMutation = useMutation({
    mutationFn: (repos: GithubRepo[]) =>
      generateProjectsFromRepos({ data: { repos } }),
    onSuccess: (data) => setGeneratedText(data),
  })

  const appendMutation = useMutation({
    mutationFn: (text: string) => appendToMasterCv({ data: { text } }),
    onSuccess: () => {
      navigate({ to: '/dashboard' })
      toast.success('Added to your master CV')
    },
  })

  const selectedRepos = (mutation.data ?? []).filter((r) =>
    selected.includes(r.name),
  )

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-6">
      <h1 className="text-3xl font-display font-semibold">
        Import from GitHub
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Connect GitHub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="GitHub username"
              autoComplete="off"
            />
            <Button
              onClick={() => mutation.mutate(username)}
              disabled={!username.trim() || mutation.isPending}
            >
              {mutation.isPending ? 'Loading...' : 'Get repos'}
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-destructive text-sm">{mutation.error.message}</p>
          )}
        </CardContent>
      </Card>

      {mutation.isPending && (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </CardContent>
        </Card>
      )}

      {mutation.isSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>Select repositories to import</CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            <ul className="space-y-2">
              {mutation.data.map((repo) => (
                <li key={repo.name}>
                  <Label className="flex items-center gap-2">
                    <Checkbox
                      checked={selected.includes(repo.name)}
                      onCheckedChange={() => toggle(repo.name)}
                    />
                    <span className="font-medium">{repo.name}</span>
                    {repo.language && (
                      <span className="text-xs text-muted-foreground">
                        {repo.language}
                      </span>
                    )}
                  </Label>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              disabled={selected.length === 0 || generateMutation.isPending}
              onClick={() => generateMutation.mutate(selectedRepos)}
            >
              {generateMutation.isPending
                ? 'Generating...'
                : 'Generate from selected'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {generateMutation.isError && (
        <p className="text-destructive text-sm">
          {generateMutation.error.message}
        </p>
      )}
      {generateMutation.isSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Projects</CardTitle>
            <CardDescription>
              Review and edit before adding to your master CV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              rows={12}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => appendMutation.mutate(generatedText)}
              disabled={appendMutation.isPending}
            >
              {appendMutation.isPending ? 'Adding...' : 'Add to master CV'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
