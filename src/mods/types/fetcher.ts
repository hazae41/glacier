import { Result } from "mods/types/result"

export type Fetcher<D = any, E = any, K = any> =
  (key: K, more: FetcherMore) => Promise<Result<D, E, K>>

export interface FetcherMore<D = any, E = any, K = any> {
  signal?: AbortSignal
}