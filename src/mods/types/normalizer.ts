import { Optional } from "@hazae41/option"
import { Core } from "mods/core/core.js"
import { Fetched } from "mods/result/fetched.js"

export type Normalizer<D, F> =
  (fetched: Optional<Fetched<D, F>>, more: NormalizerMore) => Promise<Optional<Fetched<D, F>>>

export interface NormalizerMore {
  readonly core: Core,
  readonly shallow: boolean,
}