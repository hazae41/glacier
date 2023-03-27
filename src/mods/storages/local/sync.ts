import { SyncStorage } from "mods/storages/storage.js"
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

  get<D>(key: string, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    return JSON.parse(item) as State<D>
  }

  set<D>(key: string, value: State<D>, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    const item = JSON.stringify(value)
    localStorage.setItem(this.prefix + key, item)
  }

  delete(key: string, shallow = false) {
    if (!shallow)
      this.keys.delete(key)

    localStorage.removeItem(this.prefix + key)
  }
}