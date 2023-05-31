import { FetchedInit } from "mods/result/fetched.js"

export type Fetcher<D = unknown, K = unknown> =
  (key: K, more: FetcherMore) => Promise<FetchedInit<D>>

export interface FetcherMore {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}