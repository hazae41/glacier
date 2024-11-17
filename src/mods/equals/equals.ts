export interface Equalsable {
  equals(other: unknown): boolean
}

export namespace Equalsable {

  export function equals(a: unknown, b: unknown) {
    if (a === b)
      return true
    if (typeof a !== typeof b)
      return false
    if (typeof a === "object" && a !== null && "equals" in a)
      return (a as Equalsable).equals(b)
    return JSON.stringify(a) === JSON.stringify(b)
  }

}