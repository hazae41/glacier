import { Data, Fail } from "index.js"

export type StoredState<D = unknown, F = unknown> =
  | StoredState1<D, F>
  | StoredState2<D, F>

export interface StoredState1<D = unknown, F = unknown> {
  version?: undefined,
  data?: D
  error?: F
  time: number,
  cooldown?: number
  expiration?: number
}

export interface StoredState2<D = unknown, F = unknown> {
  version: 2,
  data?: { inner: D }
  error?: { inner: F }
  time: number,
  cooldown?: number
  expiration?: number
}

export interface StateAndAborter<D = unknown, F = unknown> {
  state: State<D, F>
  aborter?: AbortController
}

export type State<D = unknown, F = unknown> =
  | RealState<D, F>
  | FakeState<D, F>

export class RealState<D = unknown, F = unknown> {

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

export class FakeState<D = unknown, F = unknown>  {

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

export type FetchedState<D = unknown, F = unknown> =
  | DataState<D, F>
  | FailState<D, F>

export class DataState<D = unknown, F = unknown> {

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

export class FailState<D = unknown, F = unknown> {

  constructor(
    readonly error: Fail<F>,
    readonly data?: Data<D>
  ) { }

  get current() {
    return this.error
  }

}
