import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'

const client = createClient({
  baseUrl: 'https://api.stripe.com',
  fetcher,
  getHeaders: async () => ({
    Authorization: `Bearer ${import.meta.env.VITE_STRIPE_PUBLIC_KEY}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.error?.message ?? err.message,
    code: err.raw?.error?.code,
    declineCode: err.raw?.error?.decline_code,
  }),
})

export const createCheckoutSession = (_items) => {
  throw new Error('payments.createCheckoutSession not implemented')
}

export const getPaymentIntent = (_intentId) => {
  throw new Error('payments.getPaymentIntent not implemented')
}
