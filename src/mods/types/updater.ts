import { Result } from "./result.js"
import { State } from "./state.js"

export type Updater<D> =
  (previous: State<D> | undefined, more: UpdaterMore) => AsyncGenerator<Result<D>, Result<D> | void>

export interface UpdaterMore {
  signal?: AbortSignal
}

export interface UpdaterParams {
  cooldown?: number
  expiration?: number
  timeout?: number
}