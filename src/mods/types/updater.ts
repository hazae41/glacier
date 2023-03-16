import { ResultInit } from "mods/result/result.js"
import { Optimistic } from "./optimism.js"

export type Updater<D> =
  (more: UpdaterMore) => AsyncGenerator<Optimistic<D>, ResultInit<D> | void>

export interface UpdaterMore {
  signal?: AbortSignal
}

export interface UpdaterParams {
  cooldown?: number
  expiration?: number
  timeout?: number
}