import { createClient } from '../lib/createClient.js'
import { fetcher } from '../lib/fetcher.js'

// Server-side payment calls — secret key safe here.
// Node/AWS ECS: use Stripe Node SDK instead of this HTTP client.
// CF Pages: call Stripe REST API via fetch — no SDK needed.
const client = createClient({
  baseUrl: 'https://api.stripe.com',
  fetcher,
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

export const createCheckoutSession = (_items) => {
  throw new Error('server/payments.createCheckoutSession not implemented')
}

export const createPaymentIntent = (_amount, _currency) => {
  throw new Error('server/payments.createPaymentIntent not implemented')
}

export const getSubscription = (_subscriptionId) => {
  throw new Error('server/payments.getSubscription not implemented')
}
