import { FetchResultInit } from "mods/result/result.js"
import { Times } from "mods/result/times.js"
import { OptimisticYield } from "./optimism.js"

export type Updater<D> =
  (more: UpdaterMore) => AsyncGenerator<OptimisticYield<D>, FetchResultInit<D> | void>

export interface UpdaterMore {
  signal?: AbortSignal
}

export type UpdaterParams = Times