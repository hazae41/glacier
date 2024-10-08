import { Data, DataInit } from "mods/fetched/data.js"
import { Fail, FailInit } from "mods/fetched/fail.js"

export type RawState<K = unknown, D = unknown, E = unknown> =
  | RawState1<D, E>
  | RawState2<D, E>
  | RawState3<K, D, E>
  | null
  | undefined

export interface RawState1<D = unknown, F = unknown> {
  readonly version?: undefined,
  readonly data?: D
  readonly error?: F
  readonly time: number,
  readonly cooldown?: number
  readonly expiration?: number
}

export interface RawState2<D = unknown, F = unknown> {
  readonly version: 2,
  readonly data?: DataInit<D>
  readonly error?: FailInit<F>
  readonly time: number,
  readonly cooldown?: number
  readonly expiration?: number
}

export interface RawState3<K = unknown, D = unknown, F = unknown> {
  readonly version: 3,
  readonly key: K,
  readonly data?: DataInit<D>
  readonly error?: FailInit<F>
  readonly time: number,
  readonly cooldown?: number
  readonly expiration?: number
}

export interface StateAndAborter<D, F> {
  readonly state: State<D, F>
  readonly aborter?: AbortController
}

export type State<D, F> =
  | RealState<D, F>
  | FakeState<D, F>

export class RealState<D, F> {

  constructor(
    readonly real?: FetchedState<D, F>
  ) { }

  isReal(): this is RealState<D, F> {
    return true
  }

  isFake(): false {
    return false
  }

  get fake() {
    return undefined
  }

  get current() {
    return this.real?.current
  }

  get data() {
    return this.real?.data
  }

  get error() {
    return this.real?.error
  }

}

export class FakeState<D, F> {

  constructor(
    readonly fake?: FetchedState<D, F>,
    readonly real?: FetchedState<D, F>
  ) { }

  isFake(): this is FakeState<D, F> {
    return true
  }

  isReal(): false {
    return false
  }

  get current() {
    return this.fake?.current
  }

  get data() {
    return this.fake?.data
  }

  get error() {
    return this.fake?.error
  }

}

export type FetchedState<D, F> =
  | DataState<D, F>
  | FailState<D, F>

export class DataState<D, F> {

  constructor(
    readonly data: Data<D>
  ) { }

  get current() {
    return this.data
  }

  get error() {
    return undefined
  }

}

export class FailState<D, F> {

  constructor(
    readonly error: Fail<F>,
    readonly data?: Data<D>
  ) { }

  get current() {
    return this.error
  }

}
