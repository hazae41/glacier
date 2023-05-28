import { Ok } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { Times } from "./times.js"

export interface DataInit<T> extends Times {
  readonly data: T
  ignore?(): void
}

export class Data<T> extends Ok<T> implements DataInit<T> {

  constructor(
    readonly data: T,
    readonly times: Times = {}
  ) {
    super(data)
  }

  static from<T>(init: DataInit<T>) {
    const { data, time, cooldown, expiration } = init

    init.ignore?.()

    return new Data(data, { time, cooldown, expiration })
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

  isData(): this is Data<T> {
    return true
  }

  isError(): false {
    return false
  }

  async map<U>(mapper: (data: T) => Promiseable<U>) {
    return new Data<U>(await mapper(this.get()), this.times)
  }

  mapSync<U>(mapper: (data: T) => U) {
    return new Data<U>(mapper(this.get()), this.times)
  }

}