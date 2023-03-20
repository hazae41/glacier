import { Promiseable } from "libs/promises/promises.js"
import { Error } from "./error.js"
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

  /**
   * Map this data into another, throwing if mapper throws
   * @param mutator 
   * @returns 
   */
  async map<M>(mapper: (data: D) => Promiseable<M>) {
    return new Data<M>(await mapper(this.data), this.times)
  }

  /**
   * Try to map this data into another, returning Error if mapper throws
   * @param mapper 
   * @returns 
   */
  async tryMap<M>(mapper: (data: D) => Promiseable<M>) {
    try {
      return await this.map(mapper)
    } catch (error: unknown) {
      return new Error(error, this.times)
    }
  }

  /**
   * Map this data into another, throwing if mapper throws
   * @param mutator 
   * @returns 
   */
  mapSync<M>(mapper: (data: D) => M) {
    return new Data<M>(mapper(this.data), this.times)
  }

  /**
   * Try to map this data into another, returning Error if mapper throws
   * @param mapper 
   * @returns 
   */
  tryMapSync<M>(mapper: (data: D) => M) {
    try {
      return this.mapSync(mapper)
    } catch (error: unknown) {
      return new Error(error, this.times)
    }
  }

}