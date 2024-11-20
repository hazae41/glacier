import { Nullable } from "@hazae41/option"
import { Database, Upgrader } from "@hazae41/serac"
import { Awaitable } from "libs/promises/promises.js"
import { Bicoder, Encoder } from "mods/coders/coder.js"
import { RawState } from "mods/types/state.js"
import { useRef } from "react"
import { AwaitingQueryStorage } from "../awaiting/index.js"

export type Collector = (
  storage: SeracQueryStorage,
  key: IDBValidKey
) => Awaitable<void>

export interface Collected {
  readonly key: IDBValidKey
  readonly value: unknown
  readonly state: RawState
}

export interface KeyValueCoders {
  readonly key: Encoder<string, IDBValidKey>
  readonly value: Bicoder<RawState, unknown>
}

export interface SeracQueryStorageParams {
  readonly name: string
  readonly version: number
  readonly upgrader: Upgrader
  readonly collector: Collector
  readonly encoders: KeyValueCoders
}

export class SeracQueryStorage {

  constructor(
    readonly database: Database,
    readonly encoders: KeyValueCoders,
  ) { }

  static async openAndCollectOrThrow(params: SeracQueryStorageParams) {
    const { name, version, upgrader, collector, encoders } = params

    const database = await Database.openOrThrow(name, version, upgrader)
    const storage = new SeracQueryStorage(database, encoders)

    for await (const key of database.collectOrThrow())
      await collector(storage, key)

    return storage
  }

  async getStoredOrThrow(storageKey: IDBValidKey): Promise<RawState> {
    const storageValue = await this.database.getOrThrow(storageKey)

    if (storageValue == null)
      return

    return await Promise.resolve(this.encoders.value.decodeOrThrow(storageValue))
  }

  async setStoredOrThrow(storageKey: IDBValidKey, state: Nullable<RawState>) {
    if (state == null)
      return await this.database.deleteOrThrow(storageKey)

    const storageValue = await Promise.resolve(this.encoders.value.encodeOrThrow(state))

    await this.database.setOrThrow(storageKey, storageValue, state.expiration ?? undefined)
  }

  async getOrThrow(cacheKey: string): Promise<RawState> {
    return await this.getStoredOrThrow(await Promise.resolve(this.encoders.key.encodeOrThrow(cacheKey)))
  }

  async setOrThrow(cacheKey: string, state: Nullable<RawState>) {
    return await this.setStoredOrThrow(await Promise.resolve(this.encoders.key.encodeOrThrow(cacheKey)), state)
  }

}

export function useSeracStorage(params: SeracQueryStorageParams) {
  const storage = useRef<AwaitingQueryStorage<SeracQueryStorage>>()

  if (storage.current == null)
    storage.current = new AwaitingQueryStorage(SeracQueryStorage.openAndCollectOrThrow(params))

  return storage.current
}