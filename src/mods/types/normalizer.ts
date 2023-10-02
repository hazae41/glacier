import { Nullable } from "@hazae41/option"
import { Result } from "@hazae41/result"
import { Fetched } from "mods/fetched/fetched.js"

export type Normalizer<D, F> =
  (fetched: Nullable<Fetched<D, F>>, more: NormalizerMore) => Promise<Result<Nullable<Fetched<D, F>>, Error>>

export interface NormalizerMore {
  readonly shallow: boolean,
}