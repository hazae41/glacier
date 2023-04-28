import { SyncStorage, SyncStorageParams } from "mods/storages/storage.js"
import { FullState } from "mods/types/state.js"
import { useEffect, useRef } from "react"

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
  const storage = useRef<SyncLocalStorage>()

  if (!storage.current)
    storage.current = SyncLocalStorage.create(prefix)

  useEffect(() => () => {
    storage.current?.unmount().catch(console.error)
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
export class SyncLocalStorage implements SyncStorage {

  readonly async = false as const

  readonly #onunload: () => void

  #keys = new Map<string, number>()

  constructor(
    readonly prefix = "xswr:"
  ) {
    this.#onunload = () => this.collectSync()
    addEventListener("beforeunload", this.#onunload)
  }

  static create(prefix?: string) {
    if (typeof window === "undefined")
      return
    if (typeof Storage === "undefined")
      return

    return new this(prefix)
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

  get<D>(cacheKey: string, params: SyncStorageParams<D> = {}) {
    const { keySerializer, valueSerializer } = params

    const key = keySerializer
      ? keySerializer.stringify(cacheKey)
      : cacheKey

    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    const state = valueSerializer
      ? valueSerializer.parse(item)
      : JSON.parse(item) as FullState<D>

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return state
  }

  set<D>(cacheKey: string, state: FullState<D>, params: SyncStorageParams<D> = {}) {
    const { keySerializer, valueSerializer } = params

    const key = keySerializer
      ? keySerializer.stringify(cacheKey)
      : cacheKey

    const item = valueSerializer
      ? valueSerializer.stringify(state)
      : JSON.stringify(state)

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    localStorage.setItem(this.prefix + key, item)
  }

  delete<D>(cacheKey: string, params: SyncStorageParams<D> = {}) {
    const { keySerializer } = params

    const key = keySerializer
      ? keySerializer.stringify(cacheKey)
      : cacheKey

    this.#delete(key)
  }

  #delete(key: string) {
    this.#keys.delete(key)

    localStorage.removeItem(this.prefix + key)
  }
}