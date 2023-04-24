import { Err, ErrInner, Ok, OkInner, Result, Wrapper } from "@hazae41/result"
import { Data, DataInit } from "./data.js"
import { Error, ErrorInit } from "./error.js"
import { Times } from "./times.js"

export type FetchResultInit<D = unknown, E = unknown> =
  | DataInit<D>
  | ErrorInit<E>

export type FetchResult<D = unknown, E = unknown> =
  | Data<D>
  | Error<E>

export namespace FetchResult {

  export function from<D>(init: DataInit<D>): Data<D>

  export function from<E>(init: ErrorInit<E>): Error<E>

  export function from<D, E>(init: FetchResultInit<D, E>) {
    if ("error" in init)
      return Error.from(init)
    else
      return Data.from(init)
  }

  export function rewrap<T extends Ok>(wrapper: T, times?: Times): Data<OkInner<T>>

  export function rewrap<T extends Err>(wrapper: T, times?: Times): Error<ErrInner<T>>

  export function rewrap<T extends Result>(wrapper: T, times?: Times): FetchResult<OkInner<T>, ErrInner<T>>

  export function rewrap<T>(wrapper: Wrapper<T>, times?: Times): FetchResult<T>

  export function rewrap<T>(wrapper: Wrapper<T>, times: Times = {}) {
    try {
      return new Data(wrapper.unwrap(), times)
    } catch (error: unknown) {
      return new Error(error, times)
    }
  }

}