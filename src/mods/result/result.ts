import { Err, ErrInner, Ok, OkInner, Result, Wrapper } from "@hazae41/result"
import { Data, DataInit } from "./data.js"
import { Fail, FailInit } from "./error.js"
import { Times } from "./times.js"

export type FetchedInit<D = unknown, E = unknown> =
  | DataInit<D>
  | FailInit<E>

export type Fetched<D = unknown, E = unknown> =
  | Data<D>
  | Fail<E>

export namespace Fetched {

  export function from<D>(init: DataInit<D>): Data<D>

  export function from<E>(init: FailInit<E>): Fail<E>

  export function from<D, E>(init: FetchedInit<D, E>): Fetched<D, E>

  export function from<D, E>(init: FetchedInit<D, E>): Fetched<D, E> {
    if ("error" in init)
      return Fail.from(init)
    else
      return Data.from(init)
  }

  export function rewrap<T extends Ok>(wrapper: T, times?: Times): Data<OkInner<T>>

  export function rewrap<T extends Err>(wrapper: T, times?: Times): Fail<ErrInner<T>>

  export function rewrap<T extends Result>(wrapper: T, times?: Times): Fetched<OkInner<T>, ErrInner<T>>

  export function rewrap<T>(wrapper: Wrapper<T>, times?: Times): Fetched<T>

  export function rewrap<T>(wrapper: Wrapper<T>, times: Times = {}) {
    try {
      return new Data(wrapper.unwrap(), times)
    } catch (error: unknown) {
      return new Fail(error, times)
    }
  }

}