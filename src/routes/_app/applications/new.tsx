import TailoredCvView from '#/components/TailoredCvView'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'

import { createApplication } from '#/lib/server-ai'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_app/applications/new')({
  component: New,
})

function New() {
  const mutation = useMutation({
    mutationFn: (input: {
      jobTitle: string
      company: string
      jobDescription: string
    }) => createApplication({ data: input }),
  })

  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-4">
      <div>
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g., Senior Frontend Developer"
        />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., Stripe"
        />
      </div>
      <div>
        <Label htmlFor="jobDescription">Job Description</Label>
        <Textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
          placeholder="Paste the job description here..."
        />
      </div>

      <Button
        onClick={() => {
          mutation.mutate({ jobTitle, company, jobDescription })
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Tailoring...' : 'Tailor my CV'}
      </Button>
      {mutation.isError && (
        <p className="text-red-500">{mutation.error.message}</p>
      )}

      {mutation.isSuccess && (
        <div className="space-y-6 border-t pt-6">
          <h2>Match Score: {mutation.data.matchScore}/100</h2>
          <h3 className="text-lg font-semibold">Strengths</h3>
          <ul className="list-disc pl-6">
            {mutation.data.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold">Gaps</h3>
          <ul className="list-disc pl-6">
            {mutation.data.gaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
          <TailoredCvView {...mutation.data.tailoredCv} />
          <pre className="whitespace-pre-wrap rounded border p-4 text-sm">
            {mutation.data.coverLetter}
          </pre>
        </div>
      )}
    </div>
  )
}
