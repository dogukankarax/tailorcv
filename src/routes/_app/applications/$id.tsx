import TailoredCvView from '#/components/TailoredCvView'
import { getApplicationById } from '#/lib/server-applications'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/applications/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['applications', id],
    queryFn: () => getApplicationById({ data: { id } }),
  })

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>Not found</p>

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-4">
      <h1>{data.jobTitle}</h1>
      <h2>Match Score: {data.matchScore}/100</h2>
      <h3 className="text-sm font-semibold mt-2">Strengths</h3>
      <ul className="list-disc pl-6">
        {data.strengths.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <h3 className="text-lg font-semibold">Gaps</h3>
      <ul className="list-disc pl-6">
        {data.gaps.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ul>
      <TailoredCvView {...data.tailoredCv} />
      <pre className="whitespace-pre-wrap rounded border p-4 text-sm">
        {data.coverLetter}
      </pre>
      <a href={`/api/pdf/${id}`} download className="inline-block underline">
        Download PDF
      </a>
    </div>
  )
}
