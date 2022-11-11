const { env } = process

export const host = 'https://' + (env.PAYPAL_API_HOST || 'api-m.sandbox.paypal.com')