import {
  NUMBER_FORMAT,
  NUMBER_FORMAT_CURRENCY,
  SHOP_UNIT
} from '#utils/constants'
import textile from 'textile-js'

export const shippingChargesAdapter = (charges) => {
  const { extracostAmount, extracostTitle, freeFrom, text } = charges

  return {
    info: text ? textile.parse(text) : null,
    extraCost: extracostAmount
      ? {
          value: extracostAmount,
          formatted: NUMBER_FORMAT_CURRENCY.format(extracostAmount),
          name: extracostTitle
        }
      : null,
    freeAfter: freeFrom
      ? {
          value: freeFrom,
          formatted: NUMBER_FORMAT_CURRENCY.format(freeFrom)
        }
      : null
  }
}

export const shippingRateAdapter = (rate) => {
  const { weight, price } = rate

  return {
    weight: {
      value: weight,
      formatted: NUMBER_FORMAT.format(weight) + ' ' + SHOP_UNIT.kg
    },
    price: {
      value: price,
      formatted: NUMBER_FORMAT_CURRENCY.format(price)
    }
  }
}
