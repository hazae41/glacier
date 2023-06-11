
export namespace Time {

  export function fromDelay(delay: number) {
    return Date.now() + delay
  }

  export function toDelay(time: number) {
    return time - Date.now()
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