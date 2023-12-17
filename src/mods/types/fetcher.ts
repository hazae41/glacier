import { Awaitable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/fetched/fetched.js"

export type Fetcher<K, D, F> =
  (key: K, more: FetcherMore) => Awaitable<FetchedInit<D, F>>

export interface FetcherMore {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}
