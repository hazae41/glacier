import { ResultInit } from "mods/result/result.js"
import { OptimisticYield } from "./optimism.js"

export type Updater<D> =
  (more: UpdaterMore) => AsyncGenerator<OptimisticYield<D>, ResultInit<D> | void>

export interface UpdaterMore {
  signal?: AbortSignal
}

export interface UpdaterParams {
  cooldown?: number
  expiration?: number
  timeout?: number
}