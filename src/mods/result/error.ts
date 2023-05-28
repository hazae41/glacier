import { Err } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { Times } from "./times.js"

export interface FailInit<T = unknown> extends Times {
  readonly error: T
}

export class Fail<T = unknown> extends Err<T> implements FailInit<T> {

  constructor(
    readonly error: T,
    readonly times: Times = {}
  ) {
    super(error)
  }

  static from(init: FailInit) {
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

  isError(): this is Fail<T> {
    return true
  }

  async mapErr<U>(mapper: (data: T) => Promiseable<U>): Promise<Fail<U>> {
    return new Fail<U>(await mapper(this.error), this.times)
  }

  mapErrSync<U>(mapper: (data: T) => U): Fail<U> {
    return new Fail<U>(mapper(this.error), this.times)
  }

}