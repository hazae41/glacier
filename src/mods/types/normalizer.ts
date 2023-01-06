import { Core } from "mods/core/core.js"
import { State } from "mods/types/state.js"

export type Normalizer<D = unknown> =
  (data: D, more: NormalizerMore) => Promise<D>

export interface NormalizerMore {
  core: Core,
  shallow: boolean,
  root: State
}