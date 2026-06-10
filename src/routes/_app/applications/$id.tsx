import TailoredCvView from '#/components/TailoredCvView'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Badge } from '#/components/ui/badge'
import { Button, buttonVariants } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'

import {
  deleteApplication,
  getApplicationById,
} from '#/lib/server-applications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/applications/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = Route.useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['applications', id],
    queryFn: () => getApplicationById({ data: { id } }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      navigate({ to: '/applications' })
      toast.success('Application deleted')
    },
  })

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8 space-y-4">
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
      ) : !data ? (
        <p className="text-muted-foreground">Not found</p>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="font-display text-3xl font-bold">{data.jobTitle}</h1>
            <Badge>Match Score: {data.matchScore}/100</Badge>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6">
                {data.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6">
                {data.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tailored CV</CardTitle>
            </CardHeader>
            <CardContent>
              <TailoredCvView {...data.tailoredCv} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Letter</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{data.coverLetter}</ReactMarkdown>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href={`/api/pdf/${id}`} download>
                Download PDF
              </a>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The tailored CV and cover
                    letter will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: 'destructive' })}
                    onClick={() => deleteMutation.mutate()}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}
