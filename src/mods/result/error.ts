import { Err } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { Times } from "./times.js"

export interface ErrorInit<T = unknown> extends Times {
  readonly error: T
}

export class Error<T = unknown> extends Err<T> implements ErrorInit<T> {

  constructor(
    readonly error: T,
    readonly times: Times = {}
  ) {
    super(error)
  }

  static from(init: ErrorInit) {
    const { error, time, cooldown, expiration } = init
    return new this(error, { time, cooldown, expiration })
  }

  get time() {
    return this.times.time
  }

  get cooldown() {
    return this.times.cooldown
  }

  get expiration() {
    return this.times.expiration
  }

  isData(): false {
    return false
  }

  isError(): this is Error<T> {
    return true
  }

  async mapErr<U>(mapper: (data: T) => Promiseable<U>): Promise<Error<U>> {
    return new Error<U>(await mapper(this.error), this.times)
  }

  mapErrSync<U>(mapper: (data: T) => U): Error<U> {
    return new Error<U>(mapper(this.error), this.times)
  }

}