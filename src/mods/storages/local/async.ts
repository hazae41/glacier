import { AsyncStorage } from "mods/storages/storage.js"
import { State } from "mods/types/state.js"
import { useEffect, useRef } from "react"

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
  const storage = useRef<AsyncLocalStorage>()

  if (storage.current === undefined)
    storage.current = AsyncLocalStorage.create(prefix)

  useEffect(() => () => {
    storage.current?.unmount().catch(console.error)
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
export class AsyncLocalStorage implements AsyncStorage {

  readonly async = true as const

  readonly keys = new Set<string>()

  readonly #onunload: () => void

  constructor(
    readonly prefix = "xswr:"
  ) {
    this.#onunload = () => this.collectSync()
    addEventListener("beforeunload", this.#onunload)
  }

  static create(prefix?: string) {
    if (typeof Storage === "undefined")
      return

    return new this(prefix)
  }

  async unmount() {
    removeEventListener("beforeunload", this.#onunload)

    await this.collect()
  }

  collectSync() {
    for (const key of this.keys) {
      const state = this.getSync<State>(key, true)

      if (state?.expiration === undefined)
        continue
      if (state.expiration > Date.now())
        continue

      this.delete(key)
    }
  }

  async collect() {
    for (const key of this.keys) {
      const state = await this.get(key, true)

      if (state?.expiration === undefined)
        continue
      if (state.expiration > Date.now())
        continue

      this.delete(key)
    }
  }

  getSync<T>(key: string, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    return JSON.parse(item) as T
  }

  async get<D>(key: string, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    return JSON.parse(item) as State<D>
  }

  async set<D>(key: string, value: State<D>, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    const item = JSON.stringify(value)
    localStorage.setItem(this.prefix + key, item)
  }

  async delete(key: string, shallow = false) {
    if (!shallow)
      this.keys.delete(key)

    localStorage.removeItem(this.prefix + key)
  }
}