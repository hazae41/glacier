import { Optional } from "@hazae41/option"
import { Promiseable } from "libs/promises/promises.js"
import { AsyncCoder, AsyncEncoder, SyncCoder, SyncEncoder } from "mods/serializers/serializer.js"
import { StoredState } from "mods/types/state.js"

export type Storage<K, V> =
  | SyncStorage<K, V>
  | AsyncStorage<K, V>

export interface SyncStorageSettings<D, F, K, V> {
  readonly keySerializer?: SyncEncoder<string, K>,
  readonly valueSerializer?: SyncCoder<StoredState<D, F>, V>
}

export interface AsyncStorageSettings<D, F, K, V> {
  readonly keySerializer?: AsyncEncoder<string, K>,
  readonly valueSerializer?: AsyncCoder<StoredState<D, F>, V>
}

export interface SyncStorage<K, V> {
  async: false

  /**
   * Get the data from the given key
   * @param cacheKey the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get<D, F>(cacheKey: string, settings: SyncStorageSettings<D, F, K, V>): Optional<StoredState<D, F>>

  /**
   * Set the given data to the given key
   * @param cacheKey the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<D, F>(cacheKey: string, value: StoredState<D, F>, settings: SyncStorageSettings<D, F, K, V>): void

  /**
   * Delete the given data from the given key
   * @param cacheKey the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete<D, F>(cacheKey: string, settings: SyncStorageSettings<D, F, K, V>): void

}

export interface AsyncStorage<K, V> {
  async: true

  /**
   * Get the data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get<D, F>(key: string, settings: AsyncStorageSettings<D, F, K, V>): Promiseable<Optional<StoredState<D, F>>>

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<D, F>(key: string, value: StoredState<D, F>, settings: AsyncStorageSettings<D, F, K, V>): Promiseable<void>

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete<D, F>(key: string, settings: AsyncStorageSettings<D, F, K, V>): Promiseable<void>

}