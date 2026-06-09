import { db } from '#/db'
import { user } from '#/db/schema'
import { env } from '#/lib/env'
import { requireUser } from '#/lib/require-user'
import { stripe } from '#/lib/stripe'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

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
