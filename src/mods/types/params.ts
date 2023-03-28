import { Equalser } from "mods/equals/equals.js"
import { AsyncSerializer, SyncSerializer } from "mods/serializers/serializer.js"
import { AsyncStorage, SyncStorage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"
import { State } from "./state.js"

export interface GlobalParams {
  readonly cooldown?: number
  readonly expiration?: number
  readonly timeout?: number,

  readonly equals?: Equalser
}

export type StorageParams<D> =
  | AsyncStorageParams<D>
  | SyncStorageParams<D>

export interface AsyncStorageParams<D> {
  readonly storage: AsyncStorage
  readonly serializer?: AsyncSerializer<State<D>>
}

export interface SyncStorageParams<D> {
  readonly storage: SyncStorage
  readonly serializer?: SyncSerializer<State<D>>
}

export interface QueryParams<D = unknown, K = unknown> {
  readonly cooldown?: number
  readonly expiration?: number
  readonly timeout?: number,

  readonly storage?: StorageParams<D>
  readonly keySerializer?: SyncSerializer<K>,
  readonly normalizer?: Normalizer<D>
  readonly equals?: Equalser,
}
