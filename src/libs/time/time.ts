import { Nullable } from "@hazae41/option"

export namespace Time {

  export function fromDelay(delay: Nullable<number>) {
    if (delay == null)
      return
    return Date.now() + delay
  }

  export function toDelay(time?: Nullable<number>) {
    if (time == null)
      return
    return time - Date.now()
  }

  export function isBefore(left?: Nullable<number>, right?: Nullable<number>) {
    if (left == null)
      return
    if (right == null)
      return
    return left < right
  }

  export function isAfter(left?: Nullable<number>, right?: Nullable<number>) {
    if (left == null)
      return
    if (right == null)
      return
    return left > right
  }

  export function isBeforeNow(time?: Nullable<number>) {
    return isBefore(time, Date.now())
  }

  export function isAfterNow(time?: Nullable<number>) {
    return isAfter(time, Date.now())
  }

}