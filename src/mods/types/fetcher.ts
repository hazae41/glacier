import { Err, Ok, Result } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/result/fetched.js"

export class FetchError extends Error {
  readonly #class = FetchError
  readonly name = this.#class.name

  static from(cause: unknown) {
    return new FetchError(undefined, { cause })
  }

}

export type Fetcher<K, D, F> =
  (key: K, more?: FetcherMore) => Promiseable<Result<FetchedInit<D, F>, FetchError>>

export interface FetcherMore {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}

export namespace Fetcher {

  export async function recatch<T>(callback: () => Promiseable<T>) {
    try {
      return new Ok(await callback())
    } catch (e: unknown) {
      return new Err(FetchError.from(e))
    }
  }

  export async function recatchSync<T>(callback: () => T) {
    try {
      return new Ok(callback())
    } catch (e: unknown) {
      return new Err(FetchError.from(e))
    }
  }

}