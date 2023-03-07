import { Promiseable } from "libs/promises/promises.js"
import { Data, DataInit } from "./data.js"
import { Error, ErrorInit } from "./error.js"
import { Times } from "./times.js"

export type ResultInit<D> =
  | DataInit<D>
  | ErrorInit

export type Result<D> =
  | Data<D>
  | Error

export namespace Result {

  export function from<D>(init: ResultInit<D>) {
    if ("error" in init)
      return Error.from(init)
    else
      return Data.from(init)
  }

  export async function wrap<D>(callback: () => Promiseable<D>, times: Times = {}) {
    try {
      return new Data(await callback(), times)
    } catch (error: unknown) {
      return new Error(error, times)
    }
  }

  export function wrapSync<D>(callback: () => D, times: Times = {}) {
    try {
      return new Data(callback(), times)
    } catch (error: unknown) {
      return new Error(error, times)
    }
  }

}