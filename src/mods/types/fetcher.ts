import { Promiseable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/fetched/fetched.js"

export type Fetcher<K, D, F> =
  (key: K, more: FetcherMore) => Promiseable<FetchedInit<D, F>>

export interface FetcherMore {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}
