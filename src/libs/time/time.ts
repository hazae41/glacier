export namespace Time {

  export function fromDelay(delay?: number) {
    if (delay === undefined)
      return
    if (delay < 0)
      return

    return Date.now() + delay
  }

  export function isAfterNow(time?: number) {
    if (time === undefined)
      return false
    if (time > Date.now())
      return true
    return false
  }

}