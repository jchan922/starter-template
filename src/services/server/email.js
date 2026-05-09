import { createClient } from '@/lib/server/createClient'

/**
 * Email service — stubbed until project needs email.
 * Wire to Resend, Postmark, or SendGrid here.
 * Secret API key is safe here — never runs in browser.
 */
const client = createClient({
  baseUrl: 'https://api.resend.com',
  getHeaders: async () => ({
    Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.message ?? err.message,
    code: err.raw?.name ?? 'email_error',
  }),
})

// Stub — implement when project needs email
export const sendEmail = (_to, _subject, _body) => {
  throw new Error('email.sendEmail not implemented')
}

export const sendTransactional = (_template, _recipient, _data) => {
  throw new Error('email.sendTransactional not implemented')
}
