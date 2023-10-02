/**
 * Reject a promise after x ms
 * @param {number} delay time to wait for rejection
 * @returns {Promise<Error>}
 */
export const reject = (delay = 0) => {
  return new Promise((_, rejectPromise) => {
    setTimeout(() => rejectPromise(new Error('Timeout')), delay)
  })
}

/**
 * Resolve a promise after x ms
 * @param {number} delay time to wait for resolve
 * @returns {Promise<void>}
 */
export const resolve = (delay = 0) => {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, delay))
}
