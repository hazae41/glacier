import { Nullable } from "@hazae41/option"
import { Database, Upgrader } from "@hazae41/serac"
import { Bicoder, Encoder } from "mods/coders/coder.js"
import { RawState } from "mods/types/state.js"
import { useRef } from "react"
import { AwaitingQueryStorage } from "../awaiting/index.js"

export type Collector = (
  key: IDBValidKey
) => Promise<void>

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

  static async openOrThrow(params: SeracQueryStorageParams) {
    const { name, version, upgrader, collector, encoders } = params

    const database = await Database.openOrThrow(name, version, upgrader)

    for await (const slot of database.collectOrThrow())
      await collector(slot.key)

    return new SeracQueryStorage(database, encoders)
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

    await this.database.setOrThrow(storageKey, storageValue, state.expiration)
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
    storage.current = new AwaitingQueryStorage(SeracQueryStorage.openOrThrow(params))

  return storage.current
}