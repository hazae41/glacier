import { Data, Fail, Fetched } from "index.js"

export interface StoredState<D = unknown> {
  data?: { inner: D }
  error?: { inner: unknown }
  time: number,
  cooldown?: number
  expiration?: number
}

export type State<D = unknown, F = unknown> =
  | DataState<D, F>
  | FailState<D, F>

export type DataState<D = unknown, F = unknown> =
  | RealDataState<D, F>
  | FakeDataState<D, F>

export type RealState<D = unknown, F = unknown> =
  | RealDataState<D, F>
  | RealFailState<D, F>

export type FailState<D = unknown, F = unknown> =
  | RealFailState<D, F>
  | FakeFailState<D, F>

export type FakeState<D = unknown, F = unknown> =
  | FakeDataState<D, F>
  | FakeFailState<D, F>

export class RealDataState<D = unknown, F = unknown> {

  constructor(
    public real: Data<D>
  ) { }

  get fake() {
    return undefined
  }

  get current() {
    return this.real
  }

}

export class RealFailState<D = unknown, F = unknown> {

  constructor(
    public real: Fail<F>
  ) { }

  get fake() {
    return undefined
  }

  get current() {
    return this.real
  }

}

export class FakeDataState<D = unknown, F = unknown>  {

  constructor(
    public fake: Data<D>,
    public real?: Fetched<D, F>,
  ) { }

  get current() {
    return this.fake
  }

}

export class FakeFailState<D = unknown, F = unknown> {

  constructor(
    public fake: Fail<F>,
    public real?: Fetched<D, F>
  ) { }

  get current() {
    return this.fake
  }

}