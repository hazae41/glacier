import { SyncStorage } from "mods/storages/storage.js"
import { Serializer } from "mods/types/serializer.js"
import { State } from "mods/types/state.js"
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
export function useSyncLocalStorage(prefix?: string, serializer?: Serializer) {
  const storage = useRef<SyncLocalStorage>()

  if (!storage.current)
    storage.current = SyncLocalStorage.create(prefix, serializer)

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

  readonly keys = new Set<string>()

  readonly #onunload: () => void

  constructor(
    readonly prefix = "xswr:",
    readonly serializer: Serializer = JSON
  ) {
    this.#onunload = () => this.collectSync()
    addEventListener("beforeunload", this.#onunload)
  }

  static create(prefix?: string, serializer?: Serializer) {
    if (typeof Storage === "undefined")
      return

    return new this(prefix, serializer)
  }

  async unmount() {
    removeEventListener("beforeunload", this.#onunload)

    await this.collect()
  }

  collectSync() {
    for (const key of this.keys) {
      const state = this.get<State>(key, true)

      if (state?.expiration === undefined)
        continue
      if (state.expiration > Date.now())
        continue

      this.delete(key)
    }
  }

  async collect() {
    for (const key of this.keys) {
      const state = this.get<State>(key, true)

      if (state?.expiration === undefined)
        continue
      if (state.expiration > Date.now())
        continue

      this.delete(key)
    }
  }

  get<T>(key: string, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    return this.serializer.parse(item) as T
  }

  set<T>(key: string, value: T, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    const item = this.serializer.stringify(value)
    localStorage.setItem(this.prefix + key, item)
  }

  delete(key: string, shallow = false) {
    if (!shallow)
      this.keys.delete(key)

    localStorage.removeItem(this.prefix + key)
  }
}