import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { getMyCv, saveMyCv } from '#/lib/server-cv'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const queryClient = useQueryClient()
  const { user } = Route.useRouteContext()
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['masterCv'],
    queryFn: () => getMyCv(),
  })
  const mutation = useMutation({
    mutationFn: (newContent: string) =>
      saveMyCv({ data: { content: newContent } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterCv'] })
      setIsEditing(false)
    },
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      <p className="mt-4 text-neutral-600">This is your protected dashboard.</p>
      {isLoading ? (
        <p>Loading...</p>
      ) : data && !isEditing ? (
        <div>
          <pre className="whitespace-pre-wrap rounded border p-4 text-sm">
            {data.content}
          </pre>
          <Button
            onClick={() => {
              setContent(data.content)
              setIsEditing(true)
            }}
          >
            Edit
          </Button>
        </div>
      ) : (
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your master cv in markdown..."
            rows={15}
          />
          <Button
            onClick={() => mutation.mutate(content)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
          {data && (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
