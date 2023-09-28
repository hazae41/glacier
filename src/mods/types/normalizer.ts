import { Nullable } from "@hazae41/option"
import { Fetched } from "mods/result/fetched.js"

export type Normalizer<D, F> =
  (fetched: Nullable<Fetched<D, F>>, more: NormalizerMore) => Promise<Nullable<Fetched<D, F>>>

export interface NormalizerMore {
  readonly shallow: boolean,
}