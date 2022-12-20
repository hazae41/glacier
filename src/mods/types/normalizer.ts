import { Core } from "mods/core/core.js"
import { State } from "mods/types/state.js"

export type Normalizer<D = any, E = any, K = any> =
  (data: D, more: NormalizerMore<D, E, K>) => Promise<D>

export interface NormalizerMore<D = any, E = any, K = any> {
  core: Core,
  shallow: boolean,
  root: State<D, E, K>
}