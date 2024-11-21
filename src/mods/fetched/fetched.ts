import { Catched, Err, Ok, Result } from "@hazae41/result"
import { Awaitable } from "libs/promises/promises.js"
import { Data, DataInit } from "./data.js"
import { Fail, FailInit } from "./fail.js"
import { Cached, CachedInit, Timed, TimedInit } from "./times.js"

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

  export function rewrap<T extends Ok.Infer<T>>(result: T & Timed & Cached, init?: TimedInit & CachedInit): Data<Ok.Inner<T>>

  export function rewrap<T extends Err.Infer<T>>(result: T & Timed & Cached, init?: TimedInit & CachedInit): Fail<Err.Inner<T>>

  export function rewrap<T extends Result.Infer<T>>(result: T & Timed & Cached, init?: TimedInit & CachedInit): Fetched<Ok.Inner<T>, Err.Inner<T>>

  export function rewrap<T extends Result.Infer<T>>(result: T & Timed & Cached, init: TimedInit & CachedInit = result): Fetched<Ok.Inner<T>, Err.Inner<T>> {
    if (result.isErr())
      return new Fail(result.getErr(), init)
    else
      return new Data(result.get(), init)
  }

  /**
   * Run a callback and wrap any returned value in Ok<T> and any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export async function runAndWrap<T>(callback: () => Awaitable<T>, init?: TimedInit & CachedInit): Promise<Fetched<T, unknown>> {
    try {
      return new Data(await callback(), init)
    } catch (e: unknown) {
      return new Fail(e, init)
    }
  }

  /**
   * Run a callback and wrap any returned value in Ok<T> and any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export function runAndWrapSync<T>(callback: () => T, init?: TimedInit & CachedInit): Fetched<T, unknown> {
    try {
      return new Data(callback(), init)
    } catch (e: unknown) {
      return new Fail(e, init)
    }
  }

  /**
   * Run a callback and wrap any returned value in Ok<T> and any thrown error in Err<Catched>
   * @param callback
   * @returns
   */
  export async function runAndDoubleWrap<T>(callback: () => Awaitable<T>, init?: TimedInit & CachedInit): Promise<Fetched<T, Error>> {
    try {
      return new Data(await callback(), init)
    } catch (e: unknown) {
      return new Fail(Catched.wrap(e), init)
    }
  }

  /**
   * Run a callback and wrap any returned value in Ok<T> and any thrown error in Err<Catched>
   * @param callback
   * @returns
   */
  export function runAndDoubleWrapSync<T>(callback: () => T, init?: TimedInit & CachedInit): Fetched<T, Error> {
    try {
      return new Data(callback(), init)
    } catch (e: unknown) {
      return new Fail(Catched.wrap(e), init)
    }
  }

  /**
   * Run a callback and wrap any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export async function runOrWrap<F extends Fetched.Infer<F>>(callback: () => Awaitable<F>, init?: TimedInit & CachedInit): Promise<F | Fail<unknown>> {
    try {
      return await callback()
    } catch (e: unknown) {
      return new Fail(e, init)
    }
  }

  /**
   * Run a callback and wrap any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export function runOrWrapSync<F extends Fetched.Infer<F>>(callback: () => F, init?: TimedInit & CachedInit): F | Fail<unknown> {
    try {
      return callback()
    } catch (e: unknown) {
      return new Fail(e, init)
    }
  }

  /**
   * Run a callback and wrap any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export async function runOrDoubleWrap<F extends Fetched.Infer<F>>(callback: () => Awaitable<F>, init?: TimedInit & CachedInit): Promise<F | Fail<Error>> {
    try {
      return await callback()
    } catch (e: unknown) {
      return new Fail(Catched.wrap(e), init)
    }
  }

  /**
   * Run a callback and wrap any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export function runOrDoubleWrapSync<F extends Result.Infer<F>>(callback: () => F, init: TimedInit & CachedInit): F | Fail<Error> {
    try {
      return callback()
    } catch (e: unknown) {
      return new Fail(Catched.wrap(e), init)
    }
  }

}