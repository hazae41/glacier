export type Equalser =
  (a: unknown, b: unknown) => boolean

export namespace Equals {

  export function ref<T>(a: T, b: T) {
    return a === b
  }

  export function json<T>(a: T, b: T) {
    if (a === b)
      return true
    if (typeof a !== typeof b)
      return false
    return JSON.stringify(a) === JSON.stringify(b)
  }

  export function shallow<T extends {}>(a?: T, b?: T) {
    if (a === b)
      return true
    if (typeof a !== typeof b)
      return false
    if (a === undefined || a === null)
      return false
    if (b === undefined || b === null)
      return false
    const ka = Object.keys(a)
    const kb = Object.keys(b)

    if (ka.length !== kb.length)
      return false
    for (const key of ka)
      if ((a as any)[key] !== (b as any)[key])
        return false
    return true
  }

}

