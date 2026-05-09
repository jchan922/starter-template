import { createClient } from '@/lib/server/createClient'

/**
 * Server-side payment calls.
 * Secret key is safe here — never runs in browser.
 * Stubbed until project needs payments.
 */
const client = createClient({
  baseUrl: 'https://api.stripe.com',
  getHeaders: async () => ({
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.error?.message ?? err.message,
    code: err.raw?.error?.code,
    declineCode: err.raw?.error?.decline_code,
    type: err.raw?.error?.type,
  }),
})

// Stub — implement when project needs payments
export const createCheckoutSession = (_items) => {
  throw new Error('server/payments.createCheckoutSession not implemented')
}

export const createPaymentIntent = (_amount, _currency) => {
  throw new Error('server/payments.createPaymentIntent not implemented')
}

export const getSubscription = (_subscriptionId) => {
  throw new Error('server/payments.getSubscription not implemented')
}
