import database from '#libs/database'

export const onRequest = async (request, response) => {
  const apiKey = request.headers['x-api-key'] || ''

  try {
    const query = `SELECT _id, name FROM Customer WHERE api_key = ? AND api_allowed_ips like ?`
    const [result] = await database.query(query, [apiKey, `%${request.ip}%`])

    if (!result.length) {
      response.code(403).send('Forbidden')
      return
    }
  } catch (error) {
    console.error(error)
    response.code(500).send({ error })
  }
}

export const schema = {
  headers: {
    required: ['x-api-key'],
    properties: {
      'x-api-key': {
        type: 'string',
        pattern: '^[a-z0-9]{32}$'
      }
    }
  }
}
