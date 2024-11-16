import { Nullable } from "@hazae41/option"

export namespace AbortSignals {

  export function getOrNever(signal?: Nullable<AbortSignal>) {
    if (signal != null)
      return signal
    return new AbortController().signal
  }

  export function timeoutOrNever(milliseconds?: Nullable<number>) {
    if (milliseconds != null)
      return AbortSignal.timeout(milliseconds)
    return new AbortController().signal
  }

}