import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import TailoredCvView from './TailoredCvView'

const cv = {
  summary: 'Fullstack developer.',
  skills: ['React', 'TypeScript'],
  experience: [
    { role: 'Developer', organization: 'Acme', period: '2024', highlights: ['Built X'] },
  ],
  projects: [
    { name: 'Talkbox', description: 'Chat app', highlights: ['Real-time messaging'] },
  ],
  education: [{ degree: 'BSc', institution: 'University', period: '2020-2024' }],
}

afterEach(cleanup)

describe('TailoredCvView', () => {
  it('renders summary, skills, and project name', () => {
    render(<TailoredCvView {...cv} />)
    expect(screen.getByText('Fullstack developer.')).toBeTruthy()
    expect(screen.getByText('React')).toBeTruthy()
    expect(screen.getByText('Talkbox')).toBeTruthy()
  })

  it('hides a section when its array is empty', () => {
    render(<TailoredCvView {...cv} skills={[]} />)
    expect(screen.queryByText('Skills')).toBeNull()
  })
})