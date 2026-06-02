import { getMyApplications } from '#/lib/server-applications'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/applications/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getMyApplications(),
  })
  return (
    <div className="mx-auto max-w-2xl p-8 space-y-4">
      {isLoading ? (
        <p>Loading...</p>
      ) : data?.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        <ul>
          {data?.map((app) => (
            <li key={app.id}>
              <Link to="/applications/$id" params={{ id: app.id }}>
                <h2>{app.jobTitle}</h2>
                <p>{app.company}</p>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {app.matchScore}/100
                </span>
                <p>{new Date(app.createdAt).toLocaleDateString()}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
