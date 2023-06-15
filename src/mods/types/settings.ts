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

export type StorageQuerySettings<DI, FI, DO = unknown, FO = unknown, K = unknown, V = unknown> =
  | SyncStorageQuerySettings<DI, FI, DO, FO, K, V>
  | AsyncStorageQuerySettings<DI, FI, DO, FO, K, V>

export interface SyncStorageQuerySettings<DI, FI, DO, FO, K, V> {
  readonly storage: SyncStorage<K, V>
  readonly keySerializer?: SyncEncoder<string, K>,
  readonly dataSerializer?: SyncCoder<DI, DO>
  readonly errorSerializer?: SyncCoder<FI, FO>
  readonly valueSerializer?: SyncCoder<StoredState<DO, FO>, V>
}

export interface AsyncStorageQuerySettings<DI, FI, DO, FO, K, V> {
  readonly storage: AsyncStorage<K, V>
  readonly keySerializer?: AsyncEncoder<string, K>,
  readonly dataSerializer?: AsyncCoder<DI, DO>
  readonly errorSerializer?: AsyncCoder<FI, FO>
  readonly valueSerializer?: AsyncCoder<StoredState<DO, FO>, V>
}

export namespace StorageQuerySettings {

  export function isAsync<DI, FI, DO, FO, K, V>(settings: StorageQuerySettings<DI, FI, DO, FO, K, V>): settings is AsyncStorageQuerySettings<DI, FI, DO, FO, K, V> {
    return settings.storage.async
  }

}

export interface QuerySettings<K, D, F> {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly storage?: StorageQuerySettings<D, F>
  readonly keySerializer?: SyncEncoder<K, string>,
  readonly normalizer?: Normalizer<D>
  readonly equals?: Equalser,
}
