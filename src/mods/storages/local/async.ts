import { Err, Ok, Result } from "@hazae41/result"
import { Identity } from "index.js"
import { StoredState } from "mods/types/state.js"
import { useEffect, useRef } from "react"
import { StorageCreationError } from "../errors.js"
import { AsyncStorage, AsyncStorageSettings } from "../storage.js"

/**
 * Asynchronous local storage
 * 
 * Use for compatibility with SSR
 * Use for storing large objects
 * 
 * Won't display data on first render or hydratation, you can either:
 * - use SyncLocalStorage
 * - use useFallback
 * 
 * @see SyncLocalStorage
 * @see useFallback
 */
export function useAsyncLocalStorage(prefix?: string) {
  const storage = useRef<Result<AsyncLocalStorage, StorageCreationError>>()

  if (storage.current === undefined)
    storage.current = AsyncLocalStorage.tryCreate(prefix).ignore()

  useEffect(() => () => {
    if (!storage.current?.isOk())
      return
    storage.current?.inner.unmount().catch(console.error)
  }, [])

  return storage.current
}

/**
 * Asynchronous local storage
 * 
 * Use for compatibility with SSR
 * Use for storing large objects
 * 
 * Won't display data on first render or hydratation, you can either:
 * - use SyncLocalStorage
 * - use useFallback
 * 
 * @see SyncLocalStorage
 * @see useFallback
 */
export class AsyncLocalStorage implements AsyncStorage<string, string> {

  readonly async = true as const

  readonly #onunload: () => void

  #keys = new Map<string, number>()

  private constructor(
    readonly prefix = "xswr:"
  ) {
    this.#onunload = () => this.collectSync()
    addEventListener("beforeunload", this.#onunload)
  }

  static tryCreate(prefix?: string): Result<AsyncLocalStorage, StorageCreationError> {
    if (typeof localStorage === "undefined")
      return new Err(new StorageCreationError())

    return new Ok(new AsyncLocalStorage(prefix))
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

  async get<D, F>(cacheKey: string, settings: AsyncStorageSettings<D, F, string, string>) {
    const { keySerializer = Identity, valueSerializer = JSON } = settings

    const key = await keySerializer.stringify(cacheKey)
    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    const state = await valueSerializer.parse(item)

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return state
  }

  async set<D, F>(cacheKey: string, state: StoredState<D, F>, settings: AsyncStorageSettings<D, F, string, string>) {
    const { keySerializer = Identity, valueSerializer = JSON } = settings

    const key = await keySerializer.stringify(cacheKey)
    const item = await valueSerializer.stringify(state)

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    localStorage.setItem(this.prefix + key, item)
  }

  async delete<D, F>(cacheKey: string, settings: AsyncStorageSettings<D, F, string, string>) {
    const { keySerializer = Identity } = settings

    const key = await keySerializer.stringify(cacheKey)

    await this.#delete(key)
  }

  async #delete(key: string) {
    this.#keys.delete(key)

    localStorage.removeItem(this.prefix + key)
  }
}