export type Equalser =
  (a: unknown, b: unknown) => boolean

export namespace Equals {

  export function ref(a: unknown, b: unknown) {
    return a === b
  }

  export function json<T>(a: unknown, b: unknown) {
    if (a === b)
      return true
    if (typeof a !== typeof b)
      return false
    return JSON.stringify(a) === JSON.stringify(b)
  }

  export function shallow(a?: unknown, b?: unknown) {
    if (a === b)
      return true
    if (typeof a !== typeof b)
      return false
    if (a === null || typeof a !== "object")
      return false
    if (b === null || typeof b !== "object")
      return false
    const ka = Object.keys(a)
    const kb = Object.keys(b)

    const oa = a as Record<string, unknown>
    const ob = b as Record<string, unknown>

    if (ka.length !== kb.length)
      return false
    for (const key of ka)
      if (oa[key] !== ob[key])
        return false
    return true
  }
}

