import { State, StateInit } from "mods/types/state.js"

export type Mutator<D = unknown> =
  (previous?: State<D>) => StateInit<D> | undefined
