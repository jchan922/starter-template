import { createClient } from '@/lib/client/createClient'

/**
 * Client-safe payment calls only.
 * Uses public key — never put secret key here.
 * Stubbed until project needs payments.
 */
const client = createClient({
  baseUrl: 'https://api.stripe.com',
  getHeaders: async () => ({
    Authorization: `Bearer ${import.meta.env.VITE_STRIPE_PUBLIC_KEY}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.error?.message ?? err.message,
    code: err.raw?.error?.code,
    declineCode: err.raw?.error?.decline_code,
  }),
})

// Stub — implement when project needs payments
export const createCheckoutSession = (_items) => {
  throw new Error('payments.createCheckoutSession not implemented')
}

export const getPaymentIntent = (_intentId) => {
  throw new Error('payments.getPaymentIntent not implemented')
}
