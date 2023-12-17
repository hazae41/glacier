import { Optional } from "@hazae41/option"
import { Catched, Err, Ok, Result } from "@hazae41/result"
import { Awaitable } from "libs/promises/promises.js"
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

  export interface Timed {
    readonly times?: Times
  }

  export function rewrap<T extends Ok.Infer<T>>(result: T & Timed, times?: TimesInit): Data<Ok.Inner<T>>

  export function rewrap<T extends Err.Infer<T>>(result: T & Timed, times?: TimesInit): Fail<Err.Inner<T>>

  export function rewrap<T extends Result.Infer<T>>(result: T & Timed, times?: TimesInit): Fetched<Ok.Inner<T>, Err.Inner<T>>

  export function rewrap<T extends Result.Infer<T>>(result: T & Timed, times: Optional<TimesInit> = result.times): Fetched<Ok.Inner<T>, Err.Inner<T>> {
    if (result.isErr())
      return new Fail(result.get(), times)
    else
      return new Data(result.get(), times)
  }

  /**
   * Run a callback and wrap any returned value in Ok<T> and any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export async function runAndWrap<T>(callback: () => Awaitable<T>, times: TimesInit = {}): Promise<Fetched<T, unknown>> {
    try {
      return new Data(await callback(), times)
    } catch (e: unknown) {
      return new Fail(e, times)
    }
  }

  /**
   * Run a callback and wrap any returned value in Ok<T> and any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export function runAndWrapSync<T>(callback: () => T, times: TimesInit = {}): Fetched<T, unknown> {
    try {
      return new Data(callback(), times)
    } catch (e: unknown) {
      return new Fail(e, times)
    }
  }

  /**
   * Run a callback and wrap any returned value in Ok<T> and any thrown error in Err<Catched>
   * @param callback
   * @returns
   */
  export async function runAndDoubleWrap<T>(callback: () => Awaitable<T>, times: TimesInit = {}): Promise<Fetched<T, Catched>> {
    try {
      return new Data(await callback(), times)
    } catch (e: unknown) {
      return new Fail(Catched.from(e), times)
    }
  }

  /**
   * Run a callback and wrap any returned value in Ok<T> and any thrown error in Err<Catched>
   * @param callback
   * @returns
   */
  export function runAndDoubleWrapSync<T>(callback: () => T, times: TimesInit = {}): Fetched<T, Catched> {
    try {
      return new Data(callback(), times)
    } catch (e: unknown) {
      return new Fail(Catched.from(e), times)
    }
  }

  /**
   * Run a callback and wrap any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export async function runOrWrap<F extends Fetched.Infer<F>>(callback: () => Awaitable<F>, times: TimesInit = {}): Promise<F | Fail<unknown>> {
    try {
      return await callback()
    } catch (e: unknown) {
      return new Fail(e, times)
    }
  }

  /**
   * Run a callback and wrap any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export function runOrWrapSync<F extends Fetched.Infer<F>>(callback: () => F, times: TimesInit = {}): F | Fail<unknown> {
    try {
      return callback()
    } catch (e: unknown) {
      return new Fail(e, times)
    }
  }

  /**
   * Run a callback and wrap any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export async function runOrDoubleWrap<F extends Fetched.Infer<F>>(callback: () => Awaitable<F>, times: TimesInit = {}): Promise<F | Fail<Catched>> {
    try {
      return await callback()
    } catch (e: unknown) {
      return new Fail(Catched.from(e), times)
    }
  }

  /**
   * Run a callback and wrap any thrown error in Err<unknown>
   * @param callback
   * @returns
   */
  export function runOrDoubleWrapSync<F extends Result.Infer<F>>(callback: () => F, times: TimesInit = {}): F | Fail<Catched> {
    try {
      return callback()
    } catch (e: unknown) {
      return new Fail(Catched.from(e), times)
    }
  }

}