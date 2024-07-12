/**
 * Decodes a base64 encoded string.
 *
 * @param encodedString - The base64 encoded string to decode.
 * @returns The decoded string.
 */
export function decode(encodedString: string) {
  return Buffer.from(encodedString, 'base64').toString('utf8')
}

/**
 * Encodes a string to base64.
 *
 * @param string - The string to encode.
 * @returns The base64 encoded string.
 */
export function encode(string: string) {
  return Buffer.from(string).toString('base64')
}
