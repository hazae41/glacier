import { Err, Ok, Result } from "@hazae41/result"
import { Data, DataInit } from "./data.js"
import { Fail, FailInit } from "./fail.js"
import { Times, TimesInit } from "./times.js"

export type FetchedInit<D, F> =
  | DataInit<D>
  | FailInit<F>

export namespace FetchedInit {

  export type Infer<T> =
    | DataInit.Infer<T>
    | FailInit.Infer<T>

}

export type Fetched<D, F> =
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

  export type Timed<T> = T & {
    times?: Times
  }

  export function rewrap<T extends Ok.Infer<T>>(result: Timed<T>, times?: TimesInit): Data<Ok.Inner<T>>

  export function rewrap<T extends Err.Infer<T>>(result: Timed<T>, times?: TimesInit): Fail<Err.Inner<T>>

  export function rewrap<T extends Result.Infer<T>>(result: Timed<T>, times?: TimesInit): Fetched<Ok.Inner<T>, Err.Inner<T>>

  export function rewrap<T extends Result.Infer<T>>(result: Timed<T>, times?: TimesInit): Fetched<Ok.Inner<T>, Err.Inner<T>> {
    if (result.isErr())
      return new Fail(result.get(), result.times ?? times)
    else
      return new Data(result.get(), result.times ?? times)
  }

}