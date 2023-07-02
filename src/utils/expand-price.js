import { NUMBER_FORMAT_CURRENCY } from '#constants'

export default function expandPrice(price) {
  if (!price) {
    price = 0
  }

  return {
    value: price,
    formatted: NUMBER_FORMAT_CURRENCY.format(price)
  }
}
