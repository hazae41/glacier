import { Optional } from "@hazae41/option";

export type Scroller<K, D, F> =
  (previousPage: Optional<D>) => Optional<K>