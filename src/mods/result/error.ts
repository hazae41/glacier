import { Times } from "./times.js"

export interface ErrorInit<E = unknown> extends Times {
  readonly error: E
}

export class Error<E = unknown> implements ErrorInit<E> {

  constructor(
    readonly error: E,
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

  map(mapper: unknown) {
    return this
  }

  tryMap(mapper: unknown) {
    return this
  }

  mapSync(mapper: unknown) {
    return this
  }

  tryMapSync(mapper: unknown) {
    return this
  }

}

