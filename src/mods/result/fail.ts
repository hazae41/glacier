import { Err } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { Times, TimesInit } from "./times.js"

export interface FailInit<T = unknown> extends TimesInit {
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

export class Fail<T = unknown> extends Err<T> implements FailInit<T>, Times {

  readonly error: T

  readonly time: number
  readonly cooldown?: number
  readonly expiration?: number

  constructor(error: T, times: TimesInit = {}) {
    super(error)

    const { time = Date.now(), cooldown, expiration } = times

    this.error = error
    this.time = time
    this.cooldown = cooldown
    this.expiration = expiration
  }

  static from<T>(init: FailInit<T>) {
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

  async mapErr<U>(mapper: (data: T) => Promiseable<U>): Promise<Fail<U>> {
    return new Fail<U>(await mapper(this.get()), this)
  }

  mapErrSync<U>(mapper: (data: T) => U): Fail<U> {
    return new Fail<U>(mapper(this.get()), this)
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
  async awaitErr(): Promise<Fail<Awaited<T>>> {
    return new Fail(await this.inner, this)
  }

  /**
   * Transform Result<Promise<T>, Promise<E>> into Promise<Result<T, E>>
   * @returns `await this.inner`
   */
  async awaitAll(): Promise<Fail<Awaited<T>>> {
    return await this.awaitErr()
  }

}