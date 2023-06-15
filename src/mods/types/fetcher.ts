import { Result } from "@hazae41/result"
import { FetchedInit } from "mods/result/fetched.js"

export class FetchError extends Error {
  readonly #class = FetchError
  readonly name = this.#class.name

  static from(cause: unknown) {
    return new FetchError(undefined, { cause })
  }

}

export type Fetcher<K, D, F> =
  (key: K, more?: FetcherMore) => Promise<Result<FetchedInit<D, F>, FetchError>>

export interface FetcherMore {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}