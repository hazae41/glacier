import { Wrapper } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { Data, DataInit } from "./data.js"
import { Error, ErrorInit } from "./error.js"
import { Times } from "./times.js"

export type ResultInit<D = unknown, E = unknown> =
  | DataInit<D>
  | ErrorInit<E>

export type Result<D = unknown, E = unknown> =
  | Data<D>
  | Error<E>

export namespace Result {

  export function from<D>(init: ResultInit<D>) {
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

  export async function wrap<D>(callback: () => Promiseable<D>, times: Times = {}) {
    return new Data(await callback(), times)
  }

  export async function tryWrap<D>(callback: () => Promiseable<D>, times: Times = {}) {
    try {
      return await wrap(callback, times)
    } catch (error: unknown) {
      return new Error(error, times)
    }
  }

  export function wrapSync<D>(callback: () => D, times: Times = {}) {
    return new Data(callback(), times)
  }

  export function tryWrapSync<D>(callback: () => D, times: Times = {}) {
    try {
      return wrapSync(callback, times)
    } catch (error: unknown) {
      return new Error(error, times)
    }
  }

}