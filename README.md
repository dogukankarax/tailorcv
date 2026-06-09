# TailorCV

Tailor your CV to a specific job in seconds. Paste a job posting, get a match score, a reordered CV, and a cover letter — grounded in your real GitHub projects.

Live: https://tailorcv-jvnn.onrender.com

## What it does

- Write a master CV once, in markdown.
- For any job posting, get a 0–100 match score, the strengths that line up, and the gaps to work on.
- Get a tailored CV (reordered and emphasized for that role) and a cover letter, both exportable to PDF.
- Import your public GitHub repos and turn real projects into CV bullet points.
- Free plan: 3 tailored CVs per day. Pro plan: unlimited, via Stripe.

## Stack

TanStack Start (SSR) with React 19, TanStack Router / Query / Form, Tailwind 4 and shadcn/ui, Better Auth, Drizzle ORM on Postgres (Neon), Gemini for the AI step, `@react-pdf/renderer` for PDFs, and Stripe for subscriptions.

## How it works

The AI step runs server-side as a TanStack Start server function. It sends the master CV and the job description to Gemini with a fixed response schema, then validates the result with Zod before saving it. That same structured data renders both on screen and into the PDF, so there is one source of truth instead of parsing markdown twice.

GitHub repos are pulled from the public API and turned into bullet points the user reviews and edits before they are added to the master CV. Upgrades go through Stripe Checkout; a webhook flips the user's plan to pro on payment and back to free on cancellation.

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

To receive Stripe webhooks during development:

```bash
pnpm stripe:listen
```

## Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres pooled connection string |
| `BETTER_AUTH_URL` | App base URL (`http://localhost:3000` in dev) |
| `BETTER_AUTH_SECRET` | Auth secret — `pnpm dlx @better-auth/cli secret` |
| `GEMINI_API_KEY` | Google AI Studio key |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) |
| `STRIPE_PRICE_ID` | Recurring price id for the Pro plan |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |

## Tests

```bash
pnpm test
```

## Notes

- The AI is constrained to a schema, validated with Zod, and told not to invent anything, so the output stays grounded in what the user actually wrote.
- The daily limit is a per-user row count in Postgres rather than Redis — fine at this scale and one less service to run.
- Deployed in a US region because the Gemini free API rejects requests from some datacenter locations.
