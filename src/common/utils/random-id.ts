import { randomUUID } from 'crypto'
import { random } from 'lodash-es'

export default function randomId(length?: 'short' | 'long'): string {
  const parts = randomUUID().split('-')

  switch (length) {
    case 'short':
      return parts[random(1, 3)] as string
    case 'long':
      return parts[4] as string
    default:
      return parts[0] as string
  }
}
