import { Equalser } from "mods/equals/equals.js"
import { AsyncCoder, AsyncEncoder, SyncCoder, SyncEncoder } from "mods/serializers/serializer.js"
import { AsyncStorage, SyncStorage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"
import { StoredState } from "./state.js"

export interface GlobalSettings {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly equals?: Equalser
}

export type StorageQuerySettings<D, F, K, V> =
  | SyncStorageQuerySettings<D, F, K, V>
  | AsyncStorageQuerySettings<D, F, K, V>

export interface SyncStorageQuerySettings<D, F, K, V> {
  readonly storage: SyncStorage<K, V>
  readonly keySerializer?: SyncEncoder<string, K>,
  readonly valueSerializer?: SyncCoder<StoredState<D, F>, V>
}

export interface AsyncStorageQuerySettings<D, F, K, V> {
  readonly storage: AsyncStorage<K, V>
  readonly keySerializer?: AsyncEncoder<string, K>,
  readonly valueSerializer?: AsyncCoder<StoredState<D, F>, V>
}

export namespace StorageQuerySettings {

  export function isAsync<D, F, K, V>(settings: StorageQuerySettings<D, F, K, V>): settings is AsyncStorageQuerySettings<D, F, K, V> {
    return settings.storage.async
  }

}

export interface QuerySettings<K, D, F> {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly storage?: StorageQuerySettings<D, F, unknown, unknown>
  readonly keySerializer?: SyncEncoder<K, string>,
  readonly normalizer?: Normalizer<D>
  readonly equals?: Equalser,
}
