import { Fetcher } from "./fetcher.js"
import { Mutator } from "./mutator.js"

export type Updater<D> =
  () => AsyncGenerator<Mutator<D>, Fetcher<D> | void>