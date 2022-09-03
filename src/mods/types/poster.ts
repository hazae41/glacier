import { Result } from "mods/types/result"

export type Poster<D = any, K = any> =
  (key: K, more: PosterMore) => Promise<Result<D>>

export type PosterMore<D = any> =
  { signal: AbortSignal, data?: D }