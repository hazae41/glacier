import { ResultInit } from "mods/result/result.js"

export type Fetcher<D = unknown, K = unknown> =
  (key: K, more: FetcherMore) => Promise<ResultInit<D>>

export interface FetcherMore {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}