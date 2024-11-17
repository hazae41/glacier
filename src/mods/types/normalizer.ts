import { Nullable } from "@hazae41/option"
import { Awaitable } from "libs/promises/promises.js"
import { Fetched } from "mods/fetched/fetched.js"

export type Normalizer<D, F> =
  (fetched: Nullable<Fetched<D, F>>, more: NormalizerMore) => Awaitable<Nullable<Fetched<D, F>>>

export interface NormalizerMore {
  readonly shallow: boolean,
}