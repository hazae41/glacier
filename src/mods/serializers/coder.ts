import { Ok, Result } from "@hazae41/result"

export type Encoder<I, O> =
  | SyncEncoder<I, O>
  | AsyncEncoder<I, O>

export interface SyncEncoder<I, O> {
  tryEncode(input: I): Result<O, Error>
}

export interface AsyncEncoder<I, O> {
  tryEncode(input: I): Promise<Result<O, Error>>
}

export type Bicoder<I, O> =
  | SyncBicoder<I, O>
  | AsyncBicoder<I, O>

export interface SyncBicoder<I, O> {
  tryEncode(input: I): Result<O, Error>
  tryDecode(output: O): Result<I, Error>
}

export interface AsyncBicoder<I, O> {
  tryEncode(input: I): Promise<Result<O, Error>>
  tryDecode(output: O): Promise<Result<I, Error>>
}

export namespace SyncIdentity {

  export function tryEncode<T>(value: T): Result<T, never> {
    return new Ok(value)
  }

  export function tryDecode<T>(value: T): Result<T, never> {
    return new Ok(value)
  }

}

export namespace SyncJson {

  export function tryEncode<T>(value: T): Result<string, Error> {
    return Result.runAndDoubleWrapSync(() => JSON.stringify(value))
  }

  export function tryDecode<T>(value: string): Result<T, Error> {
    return Result.runAndDoubleWrapSync(() => JSON.parse(value) as T)
  }

}

export class AsyncPipeBicoder<I, X, O> implements AsyncBicoder<I, O> {

  constructor(
    readonly outer: AsyncBicoder<I, X>,
    readonly inner: AsyncBicoder<X, O>
  ) { }

  async tryEncode(input: I): Promise<Result<O, Error>> {
    const outer = await this.outer.tryEncode(input)

    if (outer.isErr())
      return outer

    return await this.inner.tryEncode(outer.get())
  }

  async tryDecode(output: O): Promise<Result<I, Error>> {
    const inner = await this.inner.tryDecode(output)

    if (inner.isErr())
      return inner

    return await this.outer.tryDecode(inner.get())
  }

}

export class AsyncPipeEncoder<I, X, O> implements AsyncEncoder<I, O>{

  constructor(
    readonly outer: AsyncEncoder<I, X>,
    readonly inner: AsyncEncoder<X, O>
  ) { }

  async tryEncode(input: I): Promise<Result<O, Error>> {
    const outer = await this.outer.tryEncode(input)

    if (outer.isErr())
      return outer

    return await this.inner.tryEncode(outer.get())
  }

}

export class SyncPipeBicoder<I, X, O> implements SyncBicoder<I, O> {

  constructor(
    readonly outer: SyncBicoder<I, X>,
    readonly inner: SyncBicoder<X, O>
  ) { }

  tryEncode(input: I): Result<O, Error> {
    const outer = this.outer.tryEncode(input)

    if (outer.isErr())
      return outer

    return this.inner.tryEncode(outer.get())
  }

  tryDecode(output: O): Result<I, Error> {
    const inner = this.inner.tryDecode(output)

    if (inner.isErr())
      return inner

    return this.outer.tryDecode(inner.get())
  }

}

export class SyncPipeEncoder<I, X, O> implements SyncEncoder<I, O>{

  constructor(
    readonly outer: SyncEncoder<I, X>,
    readonly inner: SyncEncoder<X, O>
  ) { }

  tryEncode(input: I): Result<O, Error> {
    const outer = this.outer.tryEncode(input)

    if (outer.isErr())
      return outer

    return this.inner.tryEncode(outer.get())
  }

}