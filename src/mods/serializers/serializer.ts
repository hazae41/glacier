import { Promiseable } from "libs/promises/promises.js"

export type Encoder<I, O> =
  | SyncEncoder<I, O>
  | AsyncEncoder<I, O>

export interface SyncEncoder<I, O> {
  stringify(input: I): O
}

export interface AsyncEncoder<I, O> {
  stringify(input: I): Promiseable<O>
}

export type Bicoder<I, O> =
  | SyncBicoder<I, O>
  | AsyncBicoder<I, O>

export interface SyncBicoder<I, O> {
  stringify(input: I): O
  parse(output: O): I
}

export interface AsyncBicoder<I, O> {
  stringify(input: I): Promiseable<O>
  parse(output: O): Promiseable<I>
}

export namespace SyncIdentity {

  export function stringify<T>(value: T): T {
    return value
  }

  export function parse<T>(value: T): T {
    return value
  }

}

export class AsyncPipeBicoder<I, X, O> implements AsyncBicoder<I, O> {

  constructor(
    readonly outer: AsyncBicoder<I, X>,
    readonly inner: AsyncBicoder<X, O>
  ) { }

  async stringify(input: I): Promise<O> {
    return await this.inner.stringify(await this.outer.stringify(input))
  }

  async parse(output: O): Promise<I> {
    return await this.outer.parse(await this.inner.parse(output))
  }

}

export class AsyncPipeEncoder<I, X, O> implements AsyncEncoder<I, O>{

  constructor(
    readonly outer: AsyncEncoder<I, X>,
    readonly inner: AsyncEncoder<X, O>
  ) { }

  async stringify(input: I): Promise<O> {
    return await this.inner.stringify(await this.outer.stringify(input))
  }

}

export class SyncPipeBicoder<I, X, O> implements SyncBicoder<I, O> {

  constructor(
    readonly outer: SyncBicoder<I, X>,
    readonly inner: SyncBicoder<X, O>
  ) { }

  stringify(input: I): O {
    return this.inner.stringify(this.outer.stringify(input))
  }

  parse(output: O): I {
    return this.outer.parse(this.inner.parse(output))
  }

}

export class SyncPipeEncoder<I, X, O> implements SyncEncoder<I, O>{

  constructor(
    readonly outer: SyncEncoder<I, X>,
    readonly inner: SyncEncoder<X, O>
  ) { }

  stringify(input: I): O {
    return this.inner.stringify(this.outer.stringify(input))
  }

}