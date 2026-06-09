import { db } from '#/db'
import { user } from '#/db/schema'
import { env } from '#/lib/env'
import { logger } from '#/lib/logger'
import { stripe } from '#/lib/stripe'
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text()
        const signature = request.headers.get('stripe-signature')
        if (!signature) {
          return new Response('Missing signature', { status: 400 })
        }

        let event
        try {
          event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET,
          )
        } catch (err) {
          logger.error({ err }, 'Stripe webhook signature verification failed')
          return new Response('Invalid signature', { status: 400 })
        }

        if (event.type === 'checkout.session.completed') {
          const checkout = event.data.object
          const userId = checkout.metadata?.userId
          const customerId = checkout.customer

          if (userId) {
            await db
              .update(user)
              .set({
                plan: 'pro',
                stripeCustomerId:
                  typeof customerId === 'string' ? customerId : null,
              })
              .where(eq(user.id, userId))
          }
        }

        if (event.type === 'customer.subscription.deleted') {
          const subscription = event.data.object
          const customerId = subscription.customer
          if (typeof customerId === 'string') {
            await db
              .update(user)
              .set({ plan: 'free' })
              .where(eq(user.stripeCustomerId, customerId))
          }
        }

        return new Response('ok', { status: 200 })
      },
    },
  },
})
