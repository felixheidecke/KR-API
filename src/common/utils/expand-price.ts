import { formatCurrency } from './number-format.js'

/**
 * Adds the formatted price
 * @param {number} price
 * @returns {value: number; formatted: string}
 */
export default function expandPrice(price: number) {
  return {
    value: price,
    formatted: formatCurrency.format(price)
  }
}

export type ExpandedPrice = ReturnType<typeof expandPrice>
