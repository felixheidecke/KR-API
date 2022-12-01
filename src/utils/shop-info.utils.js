import { NUMBER_FORMAT, NUMBER_FORMAT_CURRENCY, SHOP_UNIT } from '#constants'

export const credentialsAdapter = (credentials) => {
  const { paypal_client_id, paypal_secret, jwt_secret } = credentials

  return {
    paypal: paypal_client_id
      ? {
          clientId: paypal_client_id,
          secret: paypal_secret
        }
      : null,
    jwtSecret: jwt_secret
  }
}

export const shippingCostAdapter = ({ price, threshold }, gross) => {
  return gross > 0 && threshold > gross ? 0 : price
}

export const shippingRateAdapter = (rate) => {
  const { weight, price, altWeight } = rate

  return {
    weight: {
      value: weight,
      formatted:
        NUMBER_FORMAT.format(weight) + ' ' + (altWeight || SHOP_UNIT.kg)
    },
    price: {
      value: price,
      formatted: NUMBER_FORMAT_CURRENCY.format(price)
    }
  }
}
