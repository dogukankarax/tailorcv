import { db } from '#/db'
import { application, masterCv, user } from '#/db/schema'
import { ai } from '#/lib/gemini'
import { logger } from '#/lib/logger'
import { requireUser } from '#/lib/require-user'
import { TailoredCvSchema } from '#/schemas/tailored-cv'
import { Type } from '@google/genai'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, gte } from 'drizzle-orm'
import { z } from 'zod'

// Input payload from the client (form data)
const inputSchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  jobDescription: z
    .string()
    .min(50, 'Job description must be at least 50 characters'),
})

// Shape the AI must return (runtime-validated with Zod)
const aiOutputSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string()).min(1),
  gaps: z.array(z.string()),
  tailoredCv: TailoredCvSchema,
  coverLetter: z.string().min(1),
})

// Schema passed to the Gemini SDK (OpenAPI-style with Type enum)
const geminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: { type: Type.INTEGER },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
    tailoredCv: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              organization: { type: Type.STRING },
              period: { type: Type.STRING },
              highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['role', 'organization', 'period', 'highlights'],
          },
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['name', 'description', 'highlights'],
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              degree: { type: Type.STRING },
              institution: { type: Type.STRING },
              period: { type: Type.STRING },
            },
            required: ['degree', 'institution', 'period'],
          },
        },
      },
      required: ['summary', 'skills', 'experience', 'projects', 'education'],
    },
    coverLetter: { type: Type.STRING },
  },
  required: ['matchScore', 'strengths', 'gaps', 'tailoredCv', 'coverLetter'],
}

export const createApplication = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const currentUser = await requireUser()
    const userId = currentUser.id
    const dbUser = await db.query.user.findFirst({ where: eq(user.id, userId) })

    // 2. Fetch master CV
    const cv = await db.query.masterCv.findFirst({
      where: eq(masterCv.userId, userId),
    })
    if (!cv) throw new Error('Please set up your master CV first')

    if (dbUser?.plan !== 'pro') {
      const DAILY_LIMIT = 3

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const count = await db.$count(
        application,
        and(
          eq(application.userId, userId),
          gte(application.createdAt, todayStart),
        ),
      )

      if (count >= DAILY_LIMIT)
        throw new Error(
          `Daily limit reached (${DAILY_LIMIT} per day). Upgrade to Pro for unlimited.`,
        )
    }

    // 3. Prompt
    const prompt = `
  STRICT RULES:
  - Use ONLY information explicitly stated in the master CV.
  - If contact info (email, phone, address) is missing from CV, write [EMAIL] / [PHONE] / [LOCATION] placeholders.
  - Do NOT invent job titles, company names, dates, or accomplishments.
  - Do NOT add marketing buzzwords ("high-performance", "cutting-edge", "synergy"). Stick to factual descriptions.
  - If the CV lacks information needed for a strong tailored version, mention it as a gap instead of fabricating.

  You are a CV tailoring expert. Given a master CV and a job description, produce structured JSON with:
  - matchScore (0-100): how well the CV matches
  - strengths: CV aspects that match the job requirements
  - gaps: skills/experience the job wants but CV lacks
  - tailoredCv: a structured object with:
    summary (2-3 sentences), skills (keywords array),
    experience [{ role, organization, period, highlights[] }],
    projects [{ name, description, highlights[] }],
    education [{ degree, institution, period }].
    Reorder and emphasize what is relevant to the job. Do NOT invent.
  - coverLetter (markdown): brief, personalized cover letter (200-300 words)

Master CV:
${cv.content}

Job: ${data.jobTitle} at ${data.company}

Job Description:
${data.jobDescription}`

    // 4. Gemini call (JSON mode)
    let response
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Gemini request failed')
      throw new Error(
        'The AI service is busy right now. Please try again in a moment.',
      )
    }

    // 5. Parse + validate
    const text = response.text
    if (!text) throw new Error('No response from AI')
    const parsed = aiOutputSchema.parse(JSON.parse(text))
    const coverLetter = parsed.coverLetter.replace(/\\n/g, '\n')

    // 6. DB insert
    const rows = await db
      .insert(application)
      .values({
        userId,
        jobTitle: data.jobTitle,
        company: data.company,
        jobDescription: data.jobDescription,
        matchScore: parsed.matchScore,
        strengths: parsed.strengths,
        gaps: parsed.gaps,
        tailoredCv: parsed.tailoredCv,
        coverLetter: coverLetter,
      })
      .returning()

    const row = rows[0]
    if (!row) throw new Error('Failed to save application')
    return row
  })
