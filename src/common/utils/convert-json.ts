import { toUpper } from 'lodash-es'

export function jsonToCSV(json: Record<string, string | number>): string {
  const names = Object.keys(json)
    .map(key => `"${toUpper(key)}"`)
    .join(',')
  const values = Object.values(json)
    .map(value => `"${value}"`)
    .join(',')

  return `${names}\n${values}`
}

export function jsonToText(json: Record<string, string | number>): string {
  return Object.entries(json)
    .map(([key, value]) => `${toUpper(key)}: ${value}`)
    .join('\n\n')
}
