import { NUMBER_FORMAT_CURRENCY } from '../../constants.js'

/**
 * Adds the formatted price
 * @param {number} price
 * @returns {value: number; formatted: string}
 */
export default function expandPrice(price: number) {
  return {
    value: price,
    formatted: NUMBER_FORMAT_CURRENCY.format(price)
  }
}
