import { env } from '#/lib/env'
import { ai } from '#/lib/gemini'
import { logger } from '#/lib/logger'
import { requireUser } from '#/lib/require-user'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export type GithubRepo = {
  name: string
  description: string | null
  language: string | null
  stars: number
  topics: string[]
  url: string
}

const generateInputSchema = z.object({
  repos: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().nullable(),
        language: z.string().nullable(),
        topics: z.array(z.string()),
        url: z.string(),
      }),
    )
    .min(1, 'Select at least one repository'),
})

const inputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'GitHub username is required')
    .max(39, 'GitHub username is too long')
    .regex(
      /^(?!-)(?!.*--)[A-Za-z0-9-]+(?<!-)$/,
      'Enter a valid GitHub username',
    ),
})

export const getGithubRepos = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser()
    const username = encodeURIComponent(data.username)

    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(env.GITHUB_TOKEN && {
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          }),
        },
      },
    )

    if (res.status === 404) throw new Error('GitHub user not found')
    if (!res.ok) {
      logger.error({ status: res.status }, 'GitHub API request failed')
      throw new Error('Could not fetch GitHub repositories. Please try again.')
    }

    const repos = (await res.json()) as Array<{
      name: string
      description: string | null
      language: string | null
      stargazers_count: number
      topics: string[]
      fork: boolean
      html_url: string
    }>

    return repos
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        topics: r.topics,
        url: r.html_url,
      }))
  })

export const generateProjectsFromRepos = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => generateInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser()

    const repoList = data.repos
      .map(
        (r) =>
          `- ${r.name}${r.language ? ` (${r.language})` : ''}: ${r.description ?? 'No description'}${r.topics.length ? ` [topics: ${r.topics.join(', ')}]` : ''}`,
      )
      .join('\n')

    const prompt = `You are a CV writer. Given these GitHub repositories, write a "## Projects" section in markdown for a developer CV. For each repo: the project name as a subheading, then 1-2 concise factual bullet points covering what it does and the technologies used. Use ONLY the information provided — do NOT invent features, metrics, or technologies not listed.

Repositories:
${repoList}`

    let response
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })
    } catch (error) {
      logger.error({ err: error }, 'Gemini repos generation failed')
      throw new Error(
        'The AI service is busy right now. Please try again in a moment.',
      )
    }

    const text = response.text
    if (!text) throw new Error('No response from AI')
    return text
  })
