import { Result } from "mods/types/result"

export type Poster<D = any, E = any, K = any> =
  (key: K, more: PosterMore) => Promise<Result<D, E>>

export type PosterMore<D = any> =
  { signal: AbortSignal, data?: D }