import { Wrapper } from "@hazae41/result"
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

  export function from(init: ErrorInit): Error

  export function from<D>(init: FetchResultInit<D>) {
    if ("error" in init)
      return Error.from(init)
    else
      return Data.from(init)
  }

  export function rewrap<D>(wrapper: Wrapper<D>, times: Times = {}) {
    try {
      return new Data(wrapper.unwrap(), times)
    } catch (error: unknown) {
      return new Error(error, times)
    }
  }

}