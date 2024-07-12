import { randomUUID } from 'crypto'
import { random } from 'lodash-es'

/**
 * Generates a random ID.
 *
 * @param length - The length of the ID. Can be 'short' = 4, 'long' = 12, or undefined = 8.
 * @returns A randomly generated ID.
 */
export default function randomId(length?: 'short' | 'long'): string {
  const parts = randomUUID().split('-')

  switch (length) {
    case 'short':
      return parts[random(1, 3)] as string
    case 'long': // 12 chars
      return parts[4] as string
    default:
      return parts[0] as string
  }
}
