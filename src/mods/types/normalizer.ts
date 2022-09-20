import { Core } from "mods/core"
import { State } from "mods/types/state"

export interface NormalizerMore<D = any, E = any, K = any> {
  core: Core,
  shallow: boolean,
  root: State<D, E, K>
}

export type Normalizer<D = any, E = any, K = any> =
  (data: D, more: NormalizerMore<D, E, K>) => Promise<D>