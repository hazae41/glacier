import { Core } from "mods/core/core.js"
import { State } from "mods/types/state.js"

export type Normalizer<D = unknown> =
  (data: D, more: NormalizerMore) => Promise<D>

export interface NormalizerMore {
  readonly core: Core,
  readonly parent: State,
  readonly shallow?: boolean,
}