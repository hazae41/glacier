import { Err, Ok, Result } from "@hazae41/result"
import { SyncBicoder, SyncEncoder, SyncIdentity } from "mods/serializers/serializer.js"
import { SyncStorage } from "mods/storages/storage.js"
import { StoredState } from "mods/types/state.js"
import { useEffect, useRef } from "react"
import { StorageCreationError } from "../errors.js"

/**
 * Synchronous local storage
 * 
 * Do NOT use with SSR, it will create hydratation errors
 * Do NOT use for storing large objects, it will harm performances
 * 
 * Will display data on first render
 * 
 * @see AsyncLocalStorage
 */
export function useSyncLocalStorage(params?: SyncLocalStorageParams) {
  const storage = useRef<Result<SyncLocalStorage, StorageCreationError>>()

  if (!storage.current)
    storage.current = SyncLocalStorage.tryCreate(params).ignore()

  useEffect(() => () => {
    if (!storage.current?.isOk())
      return
    storage.current?.inner.unmount().catch(console.error)
  }, [])

  return storage.current
}

export interface SyncLocalStorageParams {
  prefix?: string,
  keySerializer?: SyncEncoder<string, string>,
  valueSerializer?: SyncBicoder<StoredState<unknown, unknown>, string>
}

/**
 * Synchronous local storage
 * 
 * Do NOT use with SSR, it will create hydratation errors
 * Do NOT use for storing large objects, it will harm performances
 * 
 * Will display data on first render
 * 
 * @see AsyncLocalStorage
 */
export class SyncLocalStorage implements SyncStorage {

  readonly async = false as const

  readonly #onunload: () => void

  #keys = new Map<string, number>()

  private constructor(
    readonly prefix = "xswr:",
    readonly keySerializer = SyncIdentity as SyncEncoder<string, string>,
    readonly valueSerializer = JSON as SyncBicoder<StoredState<unknown, unknown>, string>
  ) {
    this.#onunload = () => this.collectSync()
    addEventListener("beforeunload", this.#onunload)
  }

  static tryCreate(params: SyncLocalStorageParams = {}): Result<SyncLocalStorage, StorageCreationError> {
    const { prefix, keySerializer, valueSerializer } = params

    if (typeof localStorage === "undefined")
      return new Err(new StorageCreationError())

    return new Ok(new SyncLocalStorage(prefix, keySerializer, valueSerializer))
  }

  async unmount() {
    removeEventListener("beforeunload", this.#onunload)

    await this.collect()
  }

  async collect() {
    this.collectSync()
  }

  collectSync() {
    for (const [key, expiration] of this.#keys) {
      if (expiration > Date.now())
        continue
      this.#delete(key)
    }
  }

  get(cacheKey: string) {
    const key = this.keySerializer.stringify(cacheKey)
    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    const state = this.valueSerializer.parse(item)

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return state
  }

  set(cacheKey: string, state: StoredState<unknown, unknown>) {
    const key = this.keySerializer.stringify(cacheKey)
    const item = this.valueSerializer.stringify(state)

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    localStorage.setItem(this.prefix + key, item)
  }

  #delete(storageKey: string) {
    this.#keys.delete(storageKey)

    localStorage.removeItem(this.prefix + storageKey)
  }

  delete(cacheKey: string) {
    const key = this.keySerializer.stringify(cacheKey)

    this.#delete(key)
  }

}