// Payment service — implement for your runtime when needed.
// Node/ECS: Stripe Node SDK (npm install stripe).
// CF Pages: call Stripe REST API directly via fetch — no SDK needed.
// The interface below stays the same either way.

export const createCheckoutSession = (_items) => {
  throw new Error('server/payments.createCheckoutSession not implemented')
}

export const createPaymentIntent = (_amount, _currency) => {
  throw new Error('server/payments.createPaymentIntent not implemented')
}

export const getSubscription = (_subscriptionId) => {
  throw new Error('server/payments.getSubscription not implemented')
}
