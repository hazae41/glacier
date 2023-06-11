import { Fetcher } from "./fetcher.js"
import { Mutator } from "./mutator.js"

export type Updater<D, K> =
  () => AsyncGenerator<Mutator<D>, Fetcher<D, K> | void>