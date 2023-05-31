import { FetchedInit } from "mods/result/fetched.js"
import { Times } from "mods/result/times.js"
import { OptimisticYield } from "./optimism.js"

export type Updater<D> =
  (more: UpdaterMore) => AsyncGenerator<OptimisticYield<D>, FetchedInit<D> | void>

export interface UpdaterMore {
  signal?: AbortSignal
}

export type UpdaterParams = Times