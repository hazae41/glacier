import { Fetched } from "index.js"

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
    public real?: Fetched<D, F>
  ) { }

  get fake() {
    return undefined
  }

  get current() {
    return this.real
  }

}

export class FakeState<D = unknown, F = unknown>  {

  constructor(
    public fake?: Fetched<D, F>,
    public real?: Fetched<D, F>
  ) { }

  get current() {
    return this.fake
  }

}