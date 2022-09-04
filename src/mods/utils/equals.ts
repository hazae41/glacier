
export type Equals =
  (a: unknown, b: unknown) => boolean

export function refEquals(a: unknown, b: unknown) {
  return a === b
}

export function jsonEquals(a: unknown, b: unknown) {
  if (a === b)
    return true
  if (typeof a !== typeof b)
    return false
  return JSON.stringify(a) === JSON.stringify(b)
}

export function shallowEquals(a?: any, b?: any) {
  if (a === b)
    return true
  if (typeof a !== typeof b)
    return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)

  if (ka.length !== kb.length)
    return false
  for (const key of ka)
    if (a[key] !== b[key])
      return false
  return true
}