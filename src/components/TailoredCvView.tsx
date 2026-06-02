import type { TailoredCv } from '#/schemas/tailored-cv'

export default function TailoredCvView({
  summary,
  skills,
  experience,
  projects,
  education,
}: TailoredCv) {
  return (
    <div className="rounded border p-4 text-sm">
      <p>{summary}</p>
      {skills.length > 0 && (
        <>
          <h3 className="text-sm font-semibold mt-2">Skills</h3>
          <ul className="list-disc pl-6">
            {skills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </>
      )}
      {experience.length > 0 && (
        <>
          <h3 className="text-sm font-semibold mt-2">Experience</h3>
          {experience.map((exp, i) => (
            <div key={i} className="mt-2">
              <p className="font-medium">
                {exp.role} — {exp.organization}
              </p>
              <p className="text-xs text-neutral-500">{exp.period}</p>
              <ul className="list-disc pl-6">
                {exp.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
      {projects.length > 0 && (
        <>
          <h3 className="text-sm font-semibold mt-2">Projects</h3>
          {projects.map((p, i) => (
            <div key={i} className="mt-2">
              <p className="font-medium">{p.name}</p>
              <p>{p.description}</p>
              <ul className="list-disc pl-6">
                {p.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
      {education.length > 0 && (
        <>
          <h3 className="text-sm font-semibold mt-2">Education</h3>
          {education.map((e, i) => (
            <div key={i} className="mt-2">
              <p className="font-medium">{e.degree}</p>
              <p className="text-xs text-neutral-500">
                {e.institution} · {e.period}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
