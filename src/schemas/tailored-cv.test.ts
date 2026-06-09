import { describe, expect, it } from 'vitest'

import { TailoredCvSchema } from './tailored-cv'

describe('TailoredCvSchema', () => {
  it('accepts a valid tailored CV', () => {
    const valid = {
      summary: 'Fullstack developer.',
      skills: ['React', 'TypeScript'],
      experience: [
        {
          role: 'Developer',
          organization: 'Acme',
          period: '2024',
          highlights: ['Built X'],
        },
      ],
      projects: [
        {
          name: 'Talkbox',
          description: 'Chat app',
          highlights: ['Real-time messaging'],
        },
      ],
      education: [
        { degree: 'BSc', institution: 'University', period: '2020-2024' },
      ],
    }
    expect(TailoredCvSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing required fields', () => {
    const invalid = { summary: 'A dev' }
    expect(TailoredCvSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects wrong types', () => {
    const invalid = {
      summary: 123,
      skills: 'not-an-array',
      experience: [],
      projects: [],
      education: [],
    }
    expect(TailoredCvSchema.safeParse(invalid).success).toBe(false)
  })
})
