import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'

import { appendToMasterCv } from '#/lib/server-cv'
import type { GithubRepo } from '#/lib/server-github'
import { generateProjectsFromRepos, getGithubRepos } from '#/lib/server-github'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_app/github')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
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
  })

  const appendMutation = useMutation({
    mutationFn: (text: string) => appendToMasterCv({ data: { text } }),
    onSuccess: () => navigate({ to: '/dashboard' }),
  })

  const selectedRepos = (mutation.data ?? []).filter((r) =>
    selected.includes(r.name),
  )

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-4">
      <Label htmlFor="username">GitHub Username</Label>
      <Input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="GitHub username"
      />
      <Button onClick={() => mutation.mutate(username)}>Get repos</Button>
      {mutation.isError && (
        <p className="text-red-500">{mutation.error.message}</p>
      )}

      {mutation.isSuccess && (
        <ul className="mt-4 space-y-2">
          {mutation.data.map((repo) => (
            <li key={repo.name}>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={selected.includes(repo.name)}
                  onCheckedChange={() => toggle(repo.name)}
                />
                <span className="font-medium">{repo.name}</span>
                {repo.language && (
                  <span className="text-xs text-neutral-500">
                    {repo.language}
                  </span>
                )}
              </Label>
            </li>
          ))}
        </ul>
      )}
      <Button
        disabled={selected.length === 0 || generateMutation.isPending}
        onClick={() => generateMutation.mutate(selectedRepos)}
      >
        {generateMutation.isPending
          ? 'Generating...'
          : 'Generate from selected'}
      </Button>

      {generateMutation.isError && (
        <p className="text-red-500">{generateMutation.error.message}</p>
      )}
      {generateMutation.isSuccess && (
        <>
          <Textarea value={generateMutation.data} readOnly rows={12} />
          <Button
            onClick={() => appendMutation.mutate(generateMutation.data)}
            disabled={appendMutation.isPending}
          >
            {appendMutation.isPending ? 'Adding...' : 'Add to master CV'}
          </Button>
        </>
      )}
    </div>
  )
}
