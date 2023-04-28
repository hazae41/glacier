import { Equalser } from "mods/equals/equals.js"
import { SyncEncoder } from "mods/serializers/serializer.js"
import { AsyncStorage, AsyncStorageParams, SyncStorage, SyncStorageParams } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"

export interface GlobalParams {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly equals?: Equalser
}

export type StorageQueryParams<D> =
  | SyncStorageQueryParams<D>
  | AsyncStorageQueryParams<D>

export interface SyncStorageQueryParams<D> extends SyncStorageParams<D> {
  readonly storage?: SyncStorage
}

export interface AsyncStorageQueryParams<D> extends AsyncStorageParams<D> {
  readonly storage?: AsyncStorage
}

export interface QueryParams<D = unknown, K = unknown> {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly storage?: StorageQueryParams<D>
  readonly keySerializer?: SyncEncoder<K>,
  readonly normalizer?: Normalizer<D>
  readonly equals?: Equalser,
}
