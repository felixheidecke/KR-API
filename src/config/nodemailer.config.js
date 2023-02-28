const { env } = process

export const host = env.MAILER_HOST || 'localhost'
export const port = env.MAILER_PORT || 25
export const from = env.MAILER_FROM || 'mailer@localhost'
export const requireTLS = env.MAILER_USE_TLS === 'true' || false
export const user = env.MAILER_USER || null
export const password = env.MAILER_PASSWORD || null
export const bcc = env.MAILER_BCC || undefined
