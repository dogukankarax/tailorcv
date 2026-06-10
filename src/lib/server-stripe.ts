import { db } from '#/db'
import { application, user } from '#/db/schema'
import { env } from '#/lib/env'
import { requireUser } from '#/lib/require-user'
import { stripe } from '#/lib/stripe'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, gte } from 'drizzle-orm'
import { DAILY_LIMIT } from './server-ai'

export const createCheckoutSession = createServerFn({ method: 'POST' }).handler(
  async () => {
    const currentUser = await requireUser()

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    })
    if (dbUser?.plan === 'pro') {
      throw new Error('You are already on the Pro plan')
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      ...(dbUser?.stripeCustomerId
        ? { customer: dbUser.stripeCustomerId }
        : { customer_email: currentUser.email }),
      metadata: { userId: currentUser.id },
      success_url: `${env.BETTER_AUTH_URL}/dashboard?upgraded=true`,
      cancel_url: `${env.BETTER_AUTH_URL}/pricing`,
    })

    if (!checkout.url) throw new Error('Could not create checkout session')
    return { url: checkout.url }
  },
)

export const getMyPlan = createServerFn().handler(async () => {
  const currentUser = await requireUser()

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, currentUser.id),
  })
  return dbUser?.plan ?? 'free'
})

export const getMyUsage = createServerFn().handler(async () => {
  const currentUser = await requireUser()
  const userId = currentUser.id

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  })

  if (dbUser?.plan === 'pro') {
    return { plan: 'pro' as const, used: null, limit: null }
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const count = await db.$count(
    application,
    and(eq(application.userId, userId), gte(application.createdAt, todayStart)),
  )

  return { plan: 'free' as const, used: count, limit: DAILY_LIMIT }
})

export const createPortalSession = createServerFn({ method: 'POST' }).handler(
  async () => {
    const currentUser = await requireUser()
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    })
    if (!dbUser?.stripeCustomerId) {
      throw new Error('No active subscription found')
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${env.BETTER_AUTH_URL}/pricing`,
    })

    return { url: portal.url }
  },
)
