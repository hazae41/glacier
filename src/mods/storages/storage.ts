import { Promiseable } from "libs/promises/promises.js"
import { AsyncCoder, AsyncEncoder, SyncCoder, SyncEncoder } from "mods/serializers/serializer.js"
import { FullState } from "mods/types/state.js"

export type Storage =
  | SyncStorage
  | AsyncStorage

export interface SyncStorageParams<D> {
  readonly keySerializer?: SyncEncoder<string>,
  readonly valueSerializer?: SyncCoder<FullState<D>>
}

export interface AsyncStorageParams<D> {
  readonly keySerializer?: AsyncEncoder<string>,
  readonly valueSerializer?: AsyncCoder<FullState<D>>
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
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get<D>(key: string, params?: SyncStorageParams<D>): FullState<D> | undefined

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<D>(key: string, value: FullState<D>, params?: SyncStorageParams<D>): void

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete<D>(key: string, params?: SyncStorageParams<D>): void
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
  get<D>(key: string, params?: AsyncStorageParams<D>): Promiseable<FullState<D> | undefined>

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<D>(key: string, value: FullState<D>, params?: AsyncStorageParams<D>): Promiseable<void>

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete<D>(key: string, params?: AsyncStorageParams<D>): Promiseable<void>
}