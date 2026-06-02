import { z } from 'zod'

export const TailoredCvSchema = z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      role: z.string(),
      organization: z.string(),
      period: z.string(),
      highlights: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      period: z.string(),
    }),
  ),
})

export type TailoredCv = z.infer<typeof TailoredCvSchema>
