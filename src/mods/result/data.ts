import { Ok } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { Error } from "./error.js"
import { Times } from "./times.js"

export interface DataInit<T> extends Times {
  readonly data: T
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
    return new this(data, { time, cooldown, expiration })
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

  async map<M>(mapper: (data: T) => Promiseable<M>) {
    return new Data<M>(await mapper(this.data), this.times)
  }

  async tryMap<M>(mapper: (data: T) => Promiseable<M>) {
    try {
      return await this.map(mapper)
    } catch (error: unknown) {
      return new Error(error, this.times)
    }
  }

  mapSync<M>(mapper: (data: T) => M) {
    return new Data<M>(mapper(this.data), this.times)
  }

  tryMapSync<M>(mapper: (data: T) => M) {
    try {
      return this.mapSync(mapper)
    } catch (error: unknown) {
      return new Error(error, this.times)
    }
  }

}