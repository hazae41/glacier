
export type Encoder<I, O> =
  | SyncEncoder<I, O>
  | AsyncEncoder<I, O>

export interface SyncEncoder<I, O> {
  encodeOrThrow(input: I): O
}

export interface AsyncEncoder<I, O> {
  encodeOrThrow(input: I): Promise<O>
}

export type Bicoder<I, O> =
  | SyncBicoder<I, O>
  | AsyncBicoder<I, O>

export interface SyncBicoder<I, O> {
  encodeOrThrow(input: I): O
  decodeOrThrow(output: O): I
}

export interface AsyncBicoder<I, O> {
  encodeOrThrow(input: I): Promise<O>
  decodeOrThrow(output: O): Promise<I>
}

export namespace Identity {

  export function encodeOrThrow<T>(value: T): T {
    return value
  }

  export function decodeOrThrow<T>(value: T): T {
    return value
  }

}

export namespace Jsoned {

  export function encodeOrThrow<T>(value: T): string {
    return JSON.stringify(value)
  }

  export function decodeOrThrow<T>(value: string): T {
    return JSON.parse(value) as T
  }

}

export class AsyncPipeBicoder<I, X, O> implements AsyncBicoder<I, O> {

  constructor(
    readonly outer: AsyncBicoder<I, X>,
    readonly inner: AsyncBicoder<X, O>
  ) { }

  async encodeOrThrow(input: I): Promise<O> {
    return await this.inner.encodeOrThrow(await this.outer.encodeOrThrow(input))
  }

  async decodeOrThrow(output: O): Promise<I> {
    return await this.outer.decodeOrThrow(await this.inner.decodeOrThrow(output))
  }

}

export class AsyncPipeEncoder<I, X, O> implements AsyncEncoder<I, O> {

  constructor(
    readonly outer: AsyncEncoder<I, X>,
    readonly inner: AsyncEncoder<X, O>
  ) { }

  async encodeOrThrow(input: I): Promise<O> {
    return await this.inner.encodeOrThrow(await this.outer.encodeOrThrow(input))
  }

}

export class SyncPipeBicoder<I, X, O> implements SyncBicoder<I, O> {

  constructor(
    readonly outer: SyncBicoder<I, X>,
    readonly inner: SyncBicoder<X, O>
  ) { }

  encodeOrThrow(input: I): O {
    return this.inner.encodeOrThrow(this.outer.encodeOrThrow(input))
  }

  decodeOrThrow(output: O): I {
    return this.outer.decodeOrThrow(this.inner.decodeOrThrow(output))
  }

}

export class SyncPipeEncoder<I, X, O> implements SyncEncoder<I, O> {

  constructor(
    readonly outer: SyncEncoder<I, X>,
    readonly inner: SyncEncoder<X, O>
  ) { }

  encodeOrThrow(input: I): O {
    return this.inner.encodeOrThrow(this.outer.encodeOrThrow(input))
  }

}