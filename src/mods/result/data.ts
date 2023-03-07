import { Times } from "./times.js"

export interface DataInit<D> extends Times {
  readonly data: D
}

export class Data<D> implements DataInit<D> {

  constructor(
    readonly data: D,
    readonly times: Times = {}
  ) { }

  static from<D>(init: DataInit<D>) {
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

  unwrap() {
    return this.data
  }

  map<M>(mutator: (data: D) => M) {
    return new Data<M>(mutator(this.data), this.times)
  }

}