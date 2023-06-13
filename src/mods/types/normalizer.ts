import { Core } from "mods/core/core.js"
import { TimesInit } from "mods/result/times.js"

export type Normalizer<D> =
  (data: D, more: NormalizerMore) => Promise<D>

export interface NormalizerMore {
  readonly core: Core,
  readonly times?: TimesInit,
  readonly shallow?: boolean,
}