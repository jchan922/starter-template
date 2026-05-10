import { createClient } from '../lib/createClient.js'
import { fetcher } from '../lib/fetcher.js'

// Email service — secret key safe here.
// Node/AWS ECS: use Resend/Postmark/SendGrid SDK or Nodemailer.
// CF Pages: call provider REST API directly via fetch.
const client = createClient({
  baseUrl: 'https://api.resend.com',
  fetcher,
  getHeaders: async () => ({
    Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.message ?? err.message,
    code: err.raw?.name ?? 'email_error',
  }),
})

export const sendEmail = (_to, _subject, _body) => {
  throw new Error('email.sendEmail not implemented')
}

export const sendTransactional = (_template, _recipient, _data) => {
  throw new Error('email.sendTransactional not implemented')
}
