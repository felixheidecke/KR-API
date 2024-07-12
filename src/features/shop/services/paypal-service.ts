import { HttpError } from '#utils/http-error.js'
import type { PayPal } from '../entities/paypal.js'
import { CredentialsRepo } from '../providers/credentials-repo.js'
import { PayPalApi } from '../providers/paypal-api.js'

export interface PayPalService {
  createOrder(paypal: PayPal, total: number): Promise<void>
  captureOrder(paypal: PayPal): Promise<void>
}

export class PayPalService {
  /**
   * Creates a PayPal order.
   *
   * @param {PayPal} paypal - The PayPal object containing relevant details.
   * @param {number} total - The total amount for the order.
   * @throws {HttpError} If the order cannot be created.
   */
  public static async createOrder(paypal: PayPal, total: number) {
    if (!paypal.accessToken) {
      await PayPalService.loadCredentials(paypal)
      await PayPalService.loadAccesToken(paypal)
    }

    const response = await PayPalApi.createOrder(total, paypal.accessToken)

    if (response.status !== 'CREATED') {
      throw HttpError.BAD_REQUEST('Could not capture PayPal order.', response)
    }

    paypal.orderId = response.id
  }

  /**
   * Captures a PayPal order.
   *
   * @param {PayPal} paypal - The PayPal object containing relevant details.
   * @throws {HttpError} If the order cannot be captured.
   */
  public static async captureOrder(paypal: PayPal) {
    if (!paypal.accessToken) {
      await PayPalService.loadCredentials(paypal)
      await PayPalService.loadAccesToken(paypal)
    }

    const response = await PayPalApi.captureOrder(paypal.orderId, paypal.accessToken)

    if (response.status !== 'COMPLETED') {
      throw HttpError.BAD_REQUEST('Could not capture PayPal order.', response)
    }

    paypal.paymentId = response.id
  }

  /**
   * Retrieves the access token for PayPal API operations.
   *
   * @param {PayPal} paypal - The PayPal object to populate with the access token.
   */
  private static async loadAccesToken(paypal: PayPal) {
    const token = await PayPalApi.getAccessToken(paypal.clientId, paypal.secret)

    paypal.accessToken = token.accessToken
    paypal.accessTokenExpiresIn = token.expiresIn
  }

  /**
   * Loads PayPal credentials from the credentials repo.
   *
   * @param {PayPal} paypal - The PayPal object to populate with credentials.
   * @throws {HttpError} If PayPal is not configured for the specified module.
   */
  private static async loadCredentials(paypal: PayPal) {
    const credentials = await CredentialsRepo.readPayPalCredentials(paypal.module)

    if (!credentials) {
      throw HttpError.BAD_REQUEST('Paypal is not configured for this module.')
    }

    paypal.clientId = credentials.clientId
    paypal.secret = credentials.secret
  }
}
