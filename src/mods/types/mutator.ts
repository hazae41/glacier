import { FullState, State } from "mods/types/state.js"

export type Mutator<D = unknown> =
  (previous?: FullState<D>) => State<D> | undefined

export type FullMutator<D = unknown> =
  (previous?: FullState<D>) => FullState<D> | undefined