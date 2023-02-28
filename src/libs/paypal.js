import { host } from '#config/paypal'
import { HEADER, TOKEN, MIME_TYPE } from '#constants'
import database from '#libs/database'
import fetch from 'node-fetch'
import redis from '#libs/redis'
import join from '#utils/join-slash'

const CACHE_KEY = 'paypal-access-token'

/**
 * @param {number} module Shop id
 * @param {number} total Cart total
 * @returns {Promise<object>} order
 */

export const createOrder = async (module, total) => {
  const accessToken = await getAccessToken(module)
  const response = await fetch(join(host, 'v2/checkout/orders'), {
    method: 'POST',
    headers: {
      [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON,
      [HEADER.ACCEPT_LANGUAGE]: 'de_DE',
      [HEADER.AUTHORIZATION]: TOKEN.BEARER(accessToken)
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: total.toFixed(2)
          }
        }
      ]
    })
  })

  return await response.json()
}

/**
 * @param {number} module Shop id
 * @param {striung} orderId order id
 * @returns {Promise<object>} payment
 */

export const capturePayment = async (module, orderId) => {
  const accessToken = await getAccessToken(module)
  const response = await fetch(
    join(host, 'v2/checkout/orders', orderId, 'capture'),
    {
      method: 'POST',
      headers: {
        [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON,
        [HEADER.ACCEPT_LANGUAGE]: 'de_DE',
        [HEADER.AUTHORIZATION]: TOKEN.BEARER(accessToken)
      }
    }
  )

  return await response.json()
}

/**
 * Return the access token
 *
 * @param {number} module Shop id
 * @returns {Promise<string>} access token
 */

const getAccessToken = async (module) => {
  return (await redis.get(CACHE_KEY)) || (await generateAccessToken(module))
}

/**
 * Generate PayPal Access Token
 *
 * @param {number} module Shop id
 * @returns {Promise<string>} access token
 */

const generateAccessToken = async (module) => {
  const { clientId, secret } = await getCredentials(module)

  if (!clientId || !secret) {
    throw `No Paypal credentials found for shop ${module}`
  }

  const basicAuth = Buffer.from(clientId + ':' + secret).toString('base64')
  const response = await fetch(join(host, 'v1/oauth2/token'), {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      [HEADER.AUTHORIZATION]: TOKEN.BASIC(basicAuth)
    }
  })

  const { access_token, expires_in } = await response.json()

  // Let's cache this for a while
  await redis.SETEX(CACHE_KEY, expires_in - 60, access_token)

  return access_token
}

/**
 * Get Paypal data from database
 *
 * @param {number} module Shop id
 * @returns {Promise<object>} client and secret
 */

const getCredentials = async (module) => {
  const query = `
    SELECT paypal_client_id as clientId, paypal_secret as secret
    FROM   rtd.Shop3Credentials
    WHERE  module = ?
    LIMIT  1`

  const [rows] = await database.execute(query, [module])

  if (!rows.length) return {}

  return rows[0]
}
