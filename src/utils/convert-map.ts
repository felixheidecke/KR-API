export function toObject(map: Map<string | number, any>): object {
  return Object.fromEntries(map)
}

export function toMap(object: object): Map<string, unknown> {
  const map = new Map()

  Object.entries(object).map(([key, value]) => map.set(key, value))

  return map
}
