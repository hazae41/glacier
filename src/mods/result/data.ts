import { Ok } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { Times, TimesInit } from "./times.js"

export interface DataInit<T> extends TimesInit {
  readonly data: T
}

export namespace DataInit {

  export type Infer<T> = DataInit<Inner<T>>

  export type Inner<T> = T extends DataInit<infer Inner> ? Inner : never

}

export namespace Data {

  export type Infer<T> = Data<Inner<T>>

  export type Inner<T> = T extends Data<infer Inner> ? Inner : never

}

export class Data<T> extends Ok<T> implements DataInit<T>, Times {

  readonly data: T

  readonly time: number
  readonly cooldown?: number
  readonly expiration?: number

  constructor(data: T, times: TimesInit = {}) {
    super(data)

    const { time = Date.now(), cooldown, expiration } = times

    this.data = data
    this.time = time
    this.cooldown = cooldown
    this.expiration = expiration
  }

  static from<T>(init: DataInit<T>) {
    const { data, time, cooldown, expiration } = init

    return new Data(data, { time, cooldown, expiration })
  }

  isData(): this is Data<T> {
    return true
  }

  isFail(): false {
    return false
  }

  set<U>(inner: U): Data<U> {
    return new Data(inner, this)
  }

  setErr(inner: unknown): this {
    return this
  }

  async map<U>(mapper: (data: T) => Promiseable<U>) {
    return new Data<U>(await mapper(this.get()), this)
  }

  mapSync<U>(mapper: (data: T) => U) {
    return new Data<U>(mapper(this.get()), this)
  }

  /**
   * Transform Result<Promise<T>, E> into Promise<Result<T, E>>
   * @returns `await this.inner` if `Ok`, `this` if `Err`
   */
  async await(): Promise<Data<Awaited<T>>> {
    return new Data(await this.inner, this)
  }

  /**
   * Transform Result<T, Promise<E>> into Promise<Result<T, E>>
   * @returns `await this.inner` if `Err`, `this` if `Ok`
   */
  async awaitErr(): Promise<this> {
    return this
  }

  /**
   * Transform Result<Promise<T>, Promise<E>> into Promise<Result<T, E>>
   * @returns `await this.inner`
   */
  async awaitAll(): Promise<Data<Awaited<T>>> {
    return await this.await()
  }

}