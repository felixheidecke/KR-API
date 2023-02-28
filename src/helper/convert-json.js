import { forEach, toUpper } from 'lodash-es'

/**
 * Converts key-value pairs to simple
 * string interpretation with \n as
 * separators.
 *
 * @param {object} json Simple key-value pairs
 * @returns {string} Beautified text
 */

export const jsonToText = (json) => {
  const text = []

  forEach(json, (value, key) => {
    text.push(`${key.toUpperCase()}: ${value}`)
  })

  return text.join('\n')
}

/**
 * Converts key-value pair to simple CSV
 *
 * @param {object} json Simple key-value pair
 * @returns {string} CSV formated text
 */

export const jsonToCSV = (json) => {
  const names = Object.keys(json)
    .map((key) => `"${toUpper(key)}"`)
    .join(',')
  const values = Object.values(json)
    .map((value) => `"${value}"`)
    .join(',')

  return `${names}\n${values}`
}
