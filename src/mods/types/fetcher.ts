import { Result } from "mods/types/result"

export type Fetcher<D extends N = any, E = any, N = D, K = any> =
  (key: K, more: FetcherMore) => Promise<Result<D, E, N, K>>

export type FetcherMore<D extends N = any, E = any, N = D, K = any> =
  { signal: AbortSignal }