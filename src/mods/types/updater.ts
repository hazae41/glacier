import { State } from "./state"

export type Updater<D = any, E = any, K = any> =
  (previous: State<D, E, K> | undefined, more: UpdaterMore<D, E, K>) => AsyncGenerator<State<D, E, K>>

export type UpdaterMore<D = any, E = any, K = any> =
  { signal: AbortSignal }