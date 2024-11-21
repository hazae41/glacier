import { Nullable } from "@hazae41/option"

export namespace AbortSignals {

  export function getOrNever(signal?: Nullable<AbortSignal>) {
    if (signal != null)
      return signal
    return new AbortController().signal
  }

}