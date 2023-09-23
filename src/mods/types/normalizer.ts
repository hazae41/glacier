import { Optional } from "@hazae41/option"
import { Fetched } from "mods/result/fetched.js"

export type Normalizer<D, F> =
  (fetched: Optional<Fetched<D, F>>, more: NormalizerMore) => Promise<Optional<Fetched<D, F>>>

export interface NormalizerMore {
  readonly shallow: boolean,
}