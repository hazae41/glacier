import { Nullable } from "@hazae41/option";

export type Scroller<K, D, F> =
  (previousPage: D) => Nullable<K>