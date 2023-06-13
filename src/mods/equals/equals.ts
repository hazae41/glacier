import { Optional } from "@hazae41/option"

export type Equalser =
  (a: unknown, b: unknown) => Optional<boolean>

export namespace Equals {

  export function ref(a: unknown, b: unknown) {
    return a === b
  }

  export function json(a: unknown, b: unknown) {
    if (a === b)
      return true

    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch (e: unknown) { }
  }

  export function shallow(a?: unknown, b?: unknown) {
    if (a === b)
      return true

    if (a === null || typeof a !== "object")
      return false
    if (b === null || typeof b !== "object")
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

