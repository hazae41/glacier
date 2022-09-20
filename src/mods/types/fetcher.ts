import { Result } from "mods/types/result"

export type Fetcher<D = any, E = any, N extends D = D, K = any> =
  (key: K, more: FetcherMore) => Promise<Result<D, E, N, K>>

export type FetcherMore<D = any, E = any, N extends D = D, K = any> =
  { signal: AbortSignal }