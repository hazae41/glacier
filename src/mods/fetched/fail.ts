import { Err } from "@hazae41/result"
import { Awaitable } from "libs/promises/promises.js"
import { Cached, CachedInit, Timed, TimedInit } from "./times.js"

export interface FailInit<T> extends TimedInit, CachedInit {
  readonly error: T
}

export namespace FailInit {

  export type Infer<T> = FailInit<Inner<T>>

  export type Inner<T> = T extends FailInit<infer Inner> ? Inner : never

}

export namespace Fail {

  export type Infer<T> = Fail<Inner<T>>

  export type Inner<T> = T extends Fail<infer Inner> ? Inner : never

}

export class Fail<T> extends Err<T> implements FailInit<T>, Timed, Cached {

  readonly error: T

  readonly time: number

  readonly cooldown?: number
  readonly expiration?: number

  constructor(error: T, init: TimedInit & CachedInit = {}) {
    super(error)

    const { time = Date.now(), cooldown, expiration } = init

    this.error = error
    this.time = time
    this.cooldown = cooldown
    this.expiration = expiration
  }

  static from<T>(init: FailInit<T>): Fail<T> {
    const { error, time, cooldown, expiration } = init

    return new Fail(error, { time, cooldown, expiration })
  }

  isData(): false {
    return false
  }

  isFail(): this is Fail<T> {
    return true
  }

  set(inner: unknown): this {
    return this
  }

  setErr<U>(inner: U): Fail<U> {
    return new Fail(inner, this)
  }

  setInit(init?: TimedInit & CachedInit): Fail<T> {
    return new Fail(this.inner, init)
  }

  async mapErr<U>(mapper: (data: T) => Awaitable<U>): Promise<Fail<U>> {
    return new Fail<U>(await mapper(this.getErr()), this)
  }

  mapErrSync<U>(mapper: (data: T) => U): Fail<U> {
    return new Fail<U>(mapper(this.getErr()), this)
  }

  /**
   * Transform Result<Promise<T>, E> into Promise<Result<T, E>>
   * @returns `await this.inner` if `Ok`, `this` if `Err`
   */
  async await(): Promise<this> {
    return this
  }

  /**
   * Transform Result<T, Promise<E>> into Promise<Result<T, E>>
   * @returns `await this.inner` if `Err`, `this` if `Ok`
   */
  async awaitErr<T>(this: Fail<PromiseLike<T>>): Promise<Fail<Awaited<T>>> {
    return new Fail(await this.inner, this)
  }

  /**
   * Transform Result<Promise<T>, Promise<E>> into Promise<Result<T, E>>
   * @returns `await this.inner`
   */
  async awaitAll<T>(this: Fail<PromiseLike<T>>): Promise<Fail<Awaited<T>>> {
    return await this.awaitErr()
  }

}