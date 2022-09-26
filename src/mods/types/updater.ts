import { State } from "./state"

export type Updater<D = any, E = any, K = any> =
  (previous: State<D, E, K> | undefined, more: UpdaterMore<D, E, K>) => AsyncGenerator<State<D, E, K>, State<D, E, K> | void>

export interface UpdaterMore<D = any, E = any, K = any> {
  signal?: AbortSignal
}

export interface UpdaterParams<D = any, E = any, K = any> {
  cooldown?: number
  expiration?: number
  timeout?: number
}