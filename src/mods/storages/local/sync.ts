import { Err, Ok, Result } from "@hazae41/result"
import { Identity } from "mods/serializers/serializer.js"
import { SyncStorage, SyncStorageSettings } from "mods/storages/storage.js"
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
export function useSyncLocalStorage(prefix?: string) {
  const storage = useRef<Result<SyncLocalStorage, StorageCreationError>>()

  if (!storage.current)
    storage.current = SyncLocalStorage.tryCreate(prefix).ignore()

  useEffect(() => () => {
    if (!storage.current?.isOk())
      return
    storage.current?.inner.unmount().catch(console.error)
  }, [])

  return storage.current
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
export class SyncLocalStorage implements SyncStorage<string, string> {

  readonly async = false as const

  readonly #onunload: () => void

  #keys = new Map<string, number>()

  private constructor(
    readonly prefix = "xswr:"
  ) {
    this.#onunload = () => this.collectSync()
    addEventListener("beforeunload", this.#onunload)
  }

  static tryCreate(prefix?: string): Result<SyncLocalStorage, StorageCreationError> {
    if (typeof localStorage === "undefined")
      return new Err(new StorageCreationError())

    return new Ok(new SyncLocalStorage(prefix))
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

  get<D, F>(cacheKey: string, settings: SyncStorageSettings<D, F, string, string>) {
    const { keySerializer = Identity, valueSerializer = JSON } = settings

    const key = keySerializer.stringify(cacheKey)
    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    const state = valueSerializer.parse(item)

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return state
  }

  set<D, F>(cacheKey: string, state: StoredState<D, F>, settings: SyncStorageSettings<D, F, string, string>) {
    const { keySerializer = Identity, valueSerializer = JSON } = settings

    const key = keySerializer.stringify(cacheKey)
    const item = valueSerializer.stringify(state)

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    localStorage.setItem(this.prefix + key, item)
  }

  delete<D, F>(cacheKey: string, settings: SyncStorageSettings<D, F, string, string>) {
    const { keySerializer = Identity } = settings

    const key = keySerializer.stringify(cacheKey)

    this.#delete(key)
  }

  #delete(key: string) {
    this.#keys.delete(key)

    localStorage.removeItem(this.prefix + key)
  }
}