import { env } from '#/lib/env'
import { GoogleGenAI } from '@google/genai'

export const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
