import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { Textarea } from '#/components/ui/textarea'
import { getMyCv, saveMyCv } from '#/lib/server-cv'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

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
      toast.success('Master CV saved')
    },
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') === 'true') {
      toast.success('Welcome to Pro! 🎉')
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-display font-semibold">
        Welcome, {user.name}
      </h1>
      <p className="text-muted-foreground">
        Your master CV is used to tailor applications.
      </p>
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
      ) : data && !isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Master CV</CardTitle>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContent(data.content)
                  setIsEditing(true)
                }}
              >
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{data.content}</ReactMarkdown>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Edit Master CV</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your master cv in markdown..."
              rows={15}
            />
          </CardContent>
          <CardFooter className="flex gap-2">
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
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
