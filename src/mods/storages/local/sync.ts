import { SyncStorage } from "mods/storages/storage.js"
import { SyncSerializer } from "mods/types/serializer.js"
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

  readonly #onunload: () => void

  #keys = new Map<string, number>()

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

  async collect() {
    this.collectSync()
  }

  collectSync() {
    for (const [key, expiration] of this.#keys) {
      if (expiration > Date.now())
        continue
      this.delete(key)
    }
  }

  get<D>(key: string, serializer: SyncSerializer<State<D>> = JSON, shallow = false) {
    const item = localStorage.getItem(this.prefix + key)

    if (item === null)
      return

    const state = serializer.parse(item)

    if (!shallow && state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return state
  }

  set<D>(key: string, state: State<D>, serializer: SyncSerializer<State<D>> = JSON, shallow = false) {
    if (!shallow && state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    const item = serializer.stringify(state)
    localStorage.setItem(this.prefix + key, item)
  }

  delete(key: string, shallow = false) {
    if (!shallow)
      this.#keys.delete(key)

    localStorage.removeItem(this.prefix + key)
  }
}