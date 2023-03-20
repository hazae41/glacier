import { Times } from "./times.js"

export interface ErrorInit extends Times {
  readonly error: unknown
}

export class Error implements ErrorInit {

  constructor(
    readonly error: unknown,
    readonly times: Times = {}
  ) { }

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

  unwrap(): never {
    throw this.error
  }

  map(mutator: unknown) {
    return new Error(this.error, this.times)
  }

}

