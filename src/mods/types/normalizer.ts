import { TimesInit } from "index.js"
import { Core } from "mods/core/core.js"

export type Normalizer<D = unknown> =
  (data: D, more: NormalizerMore) => Promise<D>

export interface NormalizerMore {
  readonly core: Core,
  readonly times?: TimesInit,
  readonly shallow?: boolean,
}