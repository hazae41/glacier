import { Fetcher } from "./fetcher.js"
import { Mutator } from "./mutator.js"

export type Updater<K, D, F> =
  () => AsyncGenerator<Mutator<D, F>, Fetcher<K, D, F> | void>