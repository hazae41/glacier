import { State } from "./state"

export type Mutator<D = any, E = any, K = any> =
  (previous?: State<D, E, K>) => State<D, E, K> | undefined