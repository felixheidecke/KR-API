/**
 * Converts a comma-separated string into an object with boolean values.
 * @param filter - The comma-separated string to convert.
 * @returns An object with boolean values indicating whether each item in the string is included or excluded.
 */

export function mapFilterString(filter: string) {
  const filterMap: Map<string, boolean> = new Map()

  filter.split(',').forEach(i => {
    if (i.startsWith('!')) {
      filterMap.set(i.slice(1), false)
    } else {
      filterMap.set(i, true)
    }
  })

  return Object.fromEntries(filterMap)
}
