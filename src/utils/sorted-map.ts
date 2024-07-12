export function sortedMap<K, V>(map: Map<K, V>): Map<K, V> {
  return new Map<K, V>(
    [...map.entries()].sort((a, b) => {
      if (a[0] < b[0]) return -1
      if (a[0] > b[0]) return 1
      return 0
    })
  )
}
