import { FetchedInit } from "mods/result/fetched.js"

export type Fetcher<K, D, F> =
  (key: K, more: FetcherMore) => Promise<FetchedInit<D, F>>

export interface FetcherMore {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}