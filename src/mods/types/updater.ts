import { ResultInit } from "mods/result/result.js"
import { State } from "./state.js"

export type Updater<D> =
  (previous: State<D> | undefined, more: UpdaterMore) => AsyncGenerator<ResultInit<D>, ResultInit<D> | void>

export interface UpdaterMore {
  signal?: AbortSignal
}

export interface UpdaterParams {
  cooldown?: number
  expiration?: number
  timeout?: number
}