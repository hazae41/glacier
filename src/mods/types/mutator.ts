import { State } from "mods/types/state.js"

export type Mutator<D = unknown> =
  (previous?: State<D>) => State<D> | undefined