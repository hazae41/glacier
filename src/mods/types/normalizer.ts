import { Core } from "mods/core/core.js"
import { State } from "mods/types/state.js"
import { OptimisticParams } from "./optimism.js"

export type Normalizer<D = unknown> =
  (data: D, more: NormalizerMore) => Promise<D>

export interface NormalizerMore {
  readonly core: Core,
  readonly shallow: boolean,
  readonly root: State,
  readonly optimistic?: OptimisticParams
}