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

  export function stringify<T>(value: T) {
    return value
  }

  export function parse<T>(value: T) {
    return value
  }

}