export namespace Time {

  export function fromDelay(delay?: number) {
    if (delay === undefined)
      return
    if (delay < 0)
      return
    return Date.now() + delay
  }

  export function isBefore(left?: number, right?: number) {
    if (left === undefined)
      return
    if (right === undefined)
      return
    return left < right
  }

  export function isAfter(left?: number, right?: number) {
    if (left === undefined)
      return
    if (right === undefined)
      return
    return left > right
  }

  export function isBeforeNow(time?: number) {
    return isBefore(time, Date.now())
  }

  export function isAfterNow(time?: number) {
    return isAfter(time, Date.now())
  }

}