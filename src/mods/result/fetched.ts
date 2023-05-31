import { Err, Ok, Result, Wrapper } from "@hazae41/result"
import { Data, DataInit } from "./data.js"
import { Fail, FailInit } from "./fail.js"
import { Times } from "./times.js"

export type FetchedInit<D = unknown, E = unknown> =
  | DataInit<D>
  | FailInit<E>

export type Fetched<D = unknown, E = unknown> =
  | Data<D>
  | Fail<E>

export namespace Fetched {

  export type Infer<T> =
    | Data.Infer<T>
    | Fail.Infer<T>

  export function from<D>(init: DataInit<D>): Data<D>

  export function from<E>(init: FailInit<E>): Fail<E>

  export function from<D, E>(init: FetchedInit<D, E>): Fetched<D, E>

  export function from<D, E>(init: FetchedInit<D, E>): Fetched<D, E> {
    if ("error" in init)
      return Fail.from(init)
    else
      return Data.from(init)
  }

  export function rewrap<T extends Ok.Infer<T>>(wrapper: T, times?: Times): Data<Ok.Inner<T>>

  export function rewrap<T extends Err.Infer<T>>(wrapper: T, times?: Times): Fail<Err.Inner<T>>

  export function rewrap<T extends Result.Infer<T>>(wrapper: T, times?: Times): Fetched<Ok.Inner<T>, Err.Inner<T>>

  export function rewrap<T, E>(wrapper: Wrapper<T>, times?: Times): Fetched<T, E>

  export function rewrap<T, E>(wrapper: Wrapper<T>, times: Times = {}) {
    try {
      return new Data(wrapper.unwrap(), times)
    } catch (error: unknown) {
      return new Fail(error as E, times)
    }
  }

}