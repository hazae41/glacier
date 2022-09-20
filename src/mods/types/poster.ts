import { Result } from "mods/types/result"

export type Poster<D = any, E = any, K = any> =
  (key: K, more: PosterMore) => Promise<Result<D, E, K>>

export type PosterMore<D = any, E = any, K = any> =
  { signal: AbortSignal, data?: D }