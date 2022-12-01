import { NUMBER_FORMAT, NUMBER_FORMAT_CURRENCY, SHOP_UNIT } from '#constants'
import textile from 'textile-js'

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

export const shippingChargesAdapter = (charges) => {
  const { extracostAmount, extracostTitle, freeFrom, text } = charges

  return {
    info: text ? textile.parse(text) : null,
    additionalCost: extracostAmount
      ? {
          title: extracostTitle,
          value: extracostAmount,
          formatted: NUMBER_FORMAT_CURRENCY.format(extracostAmount)
        }
      : null,
    freeShippingThreshold: freeFrom
      ? {
          value: freeFrom,
          formatted: NUMBER_FORMAT_CURRENCY.format(freeFrom)
        }
      : null
  }
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
