import { apiKeys } from '#config/app.config'

export const authHook = async (request, response) => {
  const key = request.headers['x-api-key']
  const ips = apiKeys[key] || []

  // No IP matching required
  if (ips === 'any') return

  // Key and IP do not match
  if (!ips.includes(request.ip)) {
    const msg = 'Forbidden'
    response.code(403).send(msg)
    console.error('[ERR:403]', msg)
    return
  }
}

export const authSchema = {
  headers: {
    required: ['x-api-key'],
    properties: {
      'x-api-key': {
        type: 'string',
        pattern: '^[a-z0-9]{16}$'
      }
    }
  }
}
