import { Result } from "mods/types/result"

export type Poster<D extends N = any, E = any, N = D, K = any> =
  (key: K, more: PosterMore) => Promise<Result<D, E, N, K>>

export type PosterMore<D extends N = any, E = any, N = D, K = any> =
  { signal: AbortSignal, data?: D }