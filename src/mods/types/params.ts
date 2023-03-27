import { AsyncLocalStorage, AsyncSerializer, AsyncStringSerializer, SyncLocalStorage, SyncStringSerializer } from "index.js"
import { Equalser } from "mods/equals/equals.js"
import { IDBStorage } from "mods/storages/idb/basic.js"
import { Normalizer } from "mods/types/normalizer.js"
import { State } from "./state.js"

export interface GlobalParams {
  readonly cooldown?: number
  readonly expiration?: number
  readonly timeout?: number,

  readonly equals?: Equalser
}

export type StorageParams<D> =
  | IDBStorageParams<D>
  | AsyncLocalStorageParams<D>
  | SyncLocalStorageParams<D>

export interface AsyncLocalStorageParams<D> {
  readonly storage: AsyncLocalStorage
  readonly serializer: AsyncStringSerializer<State<D>>
}

export interface SyncLocalStorageParams<D> {
  readonly storage: SyncLocalStorage
  readonly serializer: SyncStringSerializer<State<D>>
}

export interface IDBStorageParams<D> {
  readonly storage: IDBStorage
  readonly serializer: AsyncSerializer<State<D>, unknown>
}

export interface QueryParams<D = unknown, K = unknown> {
  readonly cooldown?: number
  readonly expiration?: number
  readonly timeout?: number,

  readonly storage?: StorageParams<D>
  readonly keySerializer?: SyncStringSerializer<K>,
  readonly normalizer?: Normalizer<D>
  readonly equals?: Equalser,
}
