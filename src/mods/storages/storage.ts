import { Promiseable } from "libs/promises/promises.js"
import { AsyncSerializer, SyncSerializer } from "mods/types/serializer.js"
import { State } from "mods/types/state.js"

export type Storage =
  | SyncStorage
  | AsyncStorage

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
  get<D>(key: string, serializer: SyncSerializer<State<D>>, shallow?: boolean): State<D> | undefined

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<D>(key: string, value: State<D>, serializer: SyncSerializer<State<D>>, shallow?: boolean): void

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete(key: string, shallow?: boolean): void
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
  get<D>(key: string, serializer: AsyncSerializer<State<D>>, shallow?: boolean): Promiseable<State<D> | undefined>

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<D>(key: string, value: State<D>, serializer: AsyncSerializer<State<D>>, shallow?: boolean): Promiseable<void>

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete(key: string, shallow?: boolean): Promiseable<void>
}