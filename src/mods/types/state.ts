import { Fetched } from "index.js"

export interface StoredState<D = unknown> {
  data?: { inner: D }
  error?: { inner: unknown }
  time: number,
  cooldown?: number
  expiration?: number
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