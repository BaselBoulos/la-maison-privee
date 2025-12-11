import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const defaultFromEmail = process.env.RESEND_FROM_EMAIL
const resend = resendApiKey ? new Resend(resendApiKey) : null

if (!resendApiKey) {
  console.warn('[RESEND] RESEND_API_KEY is not set. Emails will fail to send.')
} else {
  console.log('[RESEND] RESEND_API_KEY detected')
}
if (!defaultFromEmail) {
  console.warn('[RESEND] RESEND_FROM_EMAIL is not set. Emails will fail to send.')
} else {
  console.log('[RESEND] RESEND_FROM_EMAIL detected')
}

if (resend) {
  console.log('[RESEND] Client initialized')
}

const nlToParas = (content: string) =>
  content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 16px; line-height:1.6;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')

export const buildEmailContent = (subject: string, body: string, clubName: string) => {
  const brandName = clubName || 'La Maison Privée'
  const brandAccent = '#0b132b'
  const brandAccentSoft = '#1c2541'
  const brandHighlight = '#3a506b'
  const brandText = '#0f172a'
  const brandMuted = '#6b7280'
  const brandBg = '#f4f6fb'

  const htmlBody = nlToParas(body || ' ')

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:${brandBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brandBg};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 12px 30px rgba(15,23,42,0.12);overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:${brandAccent};color:#e2e8f0;font-weight:600;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;">
                ${brandName}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 24px 8px 24px;color:${brandText};font-size:22px;font-weight:700;">
                ${subject}
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 16px 24px;color:${brandMuted};font-size:14px;">
                ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <div style="background:linear-gradient(135deg, ${brandAccentSoft}, ${brandHighlight});border-radius:12px;padding:16px 18px;color:#e2e8f0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;display:inline-block;">
                  Message for ${brandName} members
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 8px 24px;color:${brandText};font-size:16px;line-height:1.65;">
                ${htmlBody}
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px 24px;color:${brandMuted};font-size:13px;line-height:1.5;">
                If you have any questions, reply to this email and our team will assist.
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 24px 24px;color:${brandMuted};font-size:12px;border-top:1px solid #e5e7eb;">
                © ${new Date().getFullYear()} ${brandName}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = `${brandName}\n${subject}\n\n${body}`

  return { html, text }
}

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text: string
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailParams) => {
  if (!resend) {
    throw new Error('Resend client is not configured. Set RESEND_API_KEY.')
  }

  if (!defaultFromEmail) {
    throw new Error('Missing RESEND_FROM_EMAIL environment variable.')
  }

  const { data, error } = await resend.emails.send({
    from: defaultFromEmail,
    to,
    subject,
    html,
    text
  })

  if (error) {
    console.error('[RESEND] Error sending email', { to, subject, error: error.message })
    throw new Error(error.message)
  }

  return data
}

