import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'

import { createApplication } from '#/lib/server-ai'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_app/applications/new')({
  component: New,
})

function New() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: {
      jobTitle: string
      company: string
      jobDescription: string
    }) => createApplication({ data: input }),
    onSuccess: (result) => {
      navigate({ to: '/applications/$id', params: { id: result.id } })
      queryClient.invalidateQueries({ queryKey: ['usage'] })
    },
  })

  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8 space-y-4">
      <h1 className="text-3xl font-display font-semibold">New application</h1>
      <Card>
        <CardHeader>
          <CardDescription>
            Paste the job post. TailorCV will compare it with your master CV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jobTitle" className="mb-1.5 block">
              Job Title
            </Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
            />
          </div>
          <div>
            <Label htmlFor="company" className="mb-1.5 block">
              Company
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Stripe"
            />
          </div>
          <div>
            <Label htmlFor="jobDescription" className="mb-1.5 block">
              Job Description
            </Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the job post here..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
          {mutation.isError && (
            <p className="text-destructive text-sm">{mutation.error.message}</p>
          )}
          <Button
            onClick={() =>
              mutation.mutate({ jobTitle, company, jobDescription })
            }
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Tailoring...' : 'Create tailored CV'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
