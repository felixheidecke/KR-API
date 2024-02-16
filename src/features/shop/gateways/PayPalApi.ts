import { HEADER, MIME_TYPE } from '../../../constants.js'
import fetch from 'node-fetch'

const PAYPAL_API_HOST = 'https://' + (process.env.PAYPAL_API_HOST || 'api-m.sandbox.paypal.com')

export class PayPalApi {
  /**
   * Retrieves an access token from PayPal API using client credentials.
   * @param clientId The client ID.
   * @param secret The client secret.
   * @returns A promise that resolves to an object containing the access token and its expiration time.
   */

  public static async getAccessToken(
    clientId: string,
    secret: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await fetch(`${PAYPAL_API_HOST}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        [HEADER.CONTENT_TYPE]: 'application/x-www-form-urlencoded',
        [HEADER.AUTHORIZATION]: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    })
    const payload = (await response.json()) as {
      access_token: string
      expires_in: number
    }

    return {
      accessToken: payload.access_token,
      expiresIn: payload.expires_in
    }
  }

  /**
   * Creates a PayPal order with the specified total and access token.
   * @param total The total amount of the order.
   * @param accessToken The access token for authentication.
   * @returns A promise that resolves to the created order.
   * @throws {ModuleError} If there is an error creating the order.
   */
  public static async createOrder(total: number, accessToken: string) {
    const url = new URL('v2/checkout/orders', PAYPAL_API_HOST)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON,
        [HEADER.ACCEPT_LANGUAGE]: 'de_DE',
        [HEADER.AUTHORIZATION]: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: 'EUR', value: total.toFixed(2) }
          }
        ]
      })
    })

    return (await response.json()) as any
  }

  /**
   * Writes an order to PayPal and captures the payment.
   * @param orderId - The ID of the order to capture.
   * @param accessToken - The access token for authentication.
   * @returns The captured order details if successful.
   * @throws ModuleError if there is an error capturing the payment.
   */
  public static async captureOrder(orderId: string, accessToken: string) {
    const url = new URL(`v2/checkout/orders/${orderId}/capture`, PAYPAL_API_HOST)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON,
        [HEADER.ACCEPT_LANGUAGE]: 'de_DE',
        [HEADER.AUTHORIZATION]: `Bearer ${accessToken}`
      }
    })
    return (await response.json()) as any
  }
}
