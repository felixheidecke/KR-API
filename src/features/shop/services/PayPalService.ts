import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'
import { CredentialsRepository } from '../gateways/CredentialsRepository.js'
import { PayPalApi } from '../gateways/PayPalApi.js'

import type { PayPal } from '../entities/PayPal.js'

export class PayPalInteractor {
  /**
   * Creates a PayPal order.
   *
   * @param {PayPal} paypal - The PayPal object containing relevant details.
   * @param {number} total - The total amount for the order.
   * @throws {ModuleError} If the order cannot be created.
   */

  public static async createOrder(paypal: PayPal, total: number) {
    if (!paypal.accessToken) {
      await PayPalInteractor.loadCredentials(paypal)
      await PayPalInteractor.loadAccesToken(paypal)
    }

    const response = await PayPalApi.createOrder(total, paypal.accessToken)

    if (response.status !== 'CREATED') {
      throw new ModuleError('Could not capture PayPal order.', ErrorCodes.BAD_REQUEST, response)
    }

    paypal.orderId = response.id
  }

  /**
   * Captures a PayPal order.
   *
   * @param {PayPal} paypal - The PayPal object containing relevant details.
   * @throws {ModuleError} If the order cannot be captured.
   */

  public static async captureOrder(paypal: PayPal) {
    if (!paypal.accessToken) {
      await PayPalInteractor.loadCredentials(paypal)
      await PayPalInteractor.loadAccesToken(paypal)
    }

    const response = await PayPalApi.captureOrder(paypal.orderId, paypal.accessToken)

    if (response.status !== 'COMPLETED') {
      throw new ModuleError('Could not capture PayPal order.', ErrorCodes.BAD_REQUEST, response)
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
   * Loads PayPal credentials from the credentials repository.
   *
   * @param {PayPal} paypal - The PayPal object to populate with credentials.
   * @throws {ModuleError} If PayPal is not configured for the specified module.
   */

  private static async loadCredentials(paypal: PayPal) {
    const credentials = await CredentialsRepository.readPayPalCredentials(paypal.module)

    if (!credentials) {
      throw new ModuleError('Paypal is not configured for this module.', ErrorCodes.NOT_IMPLEMENTED)
    }

    paypal.clientId = credentials.clientId
    paypal.secret = credentials.secret
  }
}
