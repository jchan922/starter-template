// Email service — implement for your runtime when needed.
// Node/ECS: Resend/Postmark/SendGrid SDK or Nodemailer.
// CF Pages: call provider REST API directly via fetch — most SDKs support this.
// The interface below stays the same either way.

export const sendEmail = (_to, _subject, _body) => {
  throw new Error('email.sendEmail not implemented')
}

export const sendTransactional = (_template, _recipient, _data) => {
  throw new Error('email.sendTransactional not implemented')
}
