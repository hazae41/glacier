import { Promiseable } from "libs/promises/promises.js"
import { AsyncCoder, AsyncEncoder, SyncCoder, SyncEncoder } from "mods/serializers/serializer.js"
import { StoredState } from "mods/types/state.js"

export type Storage =
  | SyncStorage
  | AsyncStorage

export interface SyncStorageSettings<D, F> {
  readonly keySerializer?: SyncEncoder<string>,
  readonly valueSerializer?: SyncCoder<StoredState<D, F>>
}

export interface AsyncStorageSettings<D, F> {
  readonly keySerializer?: AsyncEncoder<string>,
  readonly valueSerializer?: AsyncCoder<StoredState<D, F>>
}

export interface SyncStorage {
  async: false

  /**
   * No longer use this storage and garbage collect now
   */
  unmount(): void

  /**
   * Performs garbage collection on current keys
   */
  collect(): Promise<void>

  /**
   * Get the data from the given key
   * @param cacheKey the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get<D, F>(cacheKey: string, settings?: SyncStorageSettings<D, F>): StoredState<D, F> | undefined

  /**
   * Set the given data to the given key
   * @param cacheKey the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<D, F>(cacheKey: string, value: StoredState<D, F>, settings?: SyncStorageSettings<D, F>): void

  /**
   * Delete the given data from the given key
   * @param cacheKey the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete<D, F>(cacheKey: string, settings?: SyncStorageSettings<D, F>): void
}

export interface AsyncStorage {
  async: true

  /**
   * No longer use this storage and garbage collect now
   */
  unmount(): void

  /**
   * Performs garbage collection on current keys
   */
  collect(): Promise<void>

  /**
   * Get the data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get<D, F>(key: string, settings?: AsyncStorageSettings<D, F>): Promiseable<StoredState<D, F> | undefined>

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<D, F>(key: string, value: StoredState<D, F>, settings?: AsyncStorageSettings<D, F>): Promiseable<void>

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete<D, F>(key: string, settings?: AsyncStorageSettings<D, F>): Promiseable<void>
}