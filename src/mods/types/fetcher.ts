import { Result } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/fetched/fetched.js"

export type Fetcher<K, D, F> =
  (key: K, more?: FetcherMore) => Promiseable<Result<FetchedInit<D, F>, Error>>

export interface FetcherMore {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}
