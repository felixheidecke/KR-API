import { sha512_256 } from '@noble/hashes/sha512'
import { bytesToHex } from '@noble/hashes/utils'

/**
 * Creates a hash value for the given data using the specified algorithm and encoding.
 *
 * @param data - The data to be hashed.
 * @param algorithm - The hashing algorithm to use. Defaults to 'sha512/256'.
 * @param digest - The encoding of the output hash value. Defaults to 'hex'.
 * @returns The hashed value of the data.
 */
export function createSha512_256Hash(data: string): any {
  return bytesToHex(sha512_256.create().update(data).digest())
}
