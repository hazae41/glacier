import { Equalser } from "mods/equals/equals.js"
import { SyncEncoder } from "mods/serializers/serializer.js"
import { AsyncStorage, AsyncStorageSettings, SyncStorage, SyncStorageSettings } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"

export interface GlobalSettings {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly equals?: Equalser
}

export type StorageQuerySettings<D, F> =
  | SyncStorageQuerySettings<D, F>
  | AsyncStorageQuerySettings<D, F>

export interface SyncStorageQuerySettings<D, F> extends SyncStorageSettings<D, F> {
  readonly storage: SyncStorage
}

export interface AsyncStorageQuerySettings<D, F> extends AsyncStorageSettings<D, F> {
  readonly storage: AsyncStorage
}

export interface QuerySettings<K, D, F> {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly storage?: StorageQuerySettings<D, F>
  readonly keySerializer?: SyncEncoder<K>,
  readonly normalizer?: Normalizer<D>
  readonly equals?: Equalser,
}
