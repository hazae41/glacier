import { Result } from "mods/types/result"

export type Fetcher<D = any, K = any> =
  (key: K, more: FetcherMore) => Promise<Result<D>>

export type FetcherMore<D = any> =
  { signal: AbortSignal }