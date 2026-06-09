const required = (key: string) => {
  const value = process.env[key]

  if (!value) {
    throw new Error(`${key} environment variable is not set`)
  }

  return value
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  BETTER_AUTH_URL: required('BETTER_AUTH_URL'),
  GEMINI_API_KEY: required('GEMINI_API_KEY'),
  STRIPE_SECRET_KEY: required('STRIPE_SECRET_KEY'),
  STRIPE_PRICE_ID: required('STRIPE_PRICE_ID'),
  STRIPE_WEBHOOK_SECRET: required('STRIPE_WEBHOOK_SECRET'),
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
}
