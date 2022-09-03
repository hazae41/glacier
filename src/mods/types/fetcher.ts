import { Result } from "mods/types/result"

export type Fetcher<D = any, E = any, K = any> =
  (key: K, more: FetcherMore) => Promise<Result<D, E>>

export type FetcherMore<D = any> =
  { signal: AbortSignal }