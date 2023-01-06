import { Result } from "mods/types/result.js"

export type Fetcher<D = unknown, K = unknown> =
  (key: K, more: FetcherMore) => Promise<Result<D>>

export interface FetcherMore {
  signal?: AbortSignal,
  cache?: "reload"
}