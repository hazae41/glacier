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

export type Coder<I, O> =
  | SyncCoder<I, O>
  | AsyncCoder<I, O>

export interface SyncCoder<I, O> {
  stringify(input: I): O
  parse(output: O): I
}

export interface AsyncCoder<I, O> {
  stringify(input: I): Promiseable<O>
  parse(output: O): Promiseable<I>
}

export namespace Identity {

  export function stringify<T>(value: T) {
    return value
  }

  export function parse<T>(value: T) {
    return value
  }

}