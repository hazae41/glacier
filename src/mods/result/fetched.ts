import { Err, Ok, Result } from "@hazae41/result"
import { Data, DataInit } from "./data.js"
import { Fail, FailInit } from "./fail.js"
import { Times, TimesInit } from "./times.js"

export type FetchedInit<D = unknown, F = unknown> =
  | DataInit<D>
  | FailInit<F>

export namespace FetchedInit {

  export type Infer<T> =
    | DataInit.Infer<T>
    | FailInit.Infer<T>

}

export type Fetched<D = unknown, F = unknown> =
  | Data<D>
  | Fail<F>

export namespace Fetched {

  export type Infer<T> =
    | Data.Infer<T>
    | Fail.Infer<T>

  export function from<T extends FetchedInit.Infer<T>>(init: T): Fetched<DataInit.Inner<T>, FailInit.Inner<T>> {
    if ("error" in init)
      return Fail.from<FailInit.Inner<T>>(init)
    else
      return Data.from<DataInit.Inner<T>>(init)
  }

  export interface Wrapper<T> {
    unwrap(): T
    times?: Times
  }

  export function rewrap<T extends Result.Infer<T>>(wrapper: T, times?: TimesInit): Fetched<Ok.Inner<T>, Err.Inner<T>>

  export function rewrap<T, E>(wrapper: Wrapper<T>, times?: TimesInit): Fetched<T, E>

  export function rewrap<T, E>(wrapper: Wrapper<T>, times?: TimesInit) {
    try {
      return new Data(wrapper.unwrap(), wrapper.times ?? times)
    } catch (error: unknown) {
      return new Fail(error as E, wrapper.times ?? times)
    }
  }

}