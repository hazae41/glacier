import { AsyncStorage } from "mods/storages/storage.js"
import { Serializer } from "mods/types/serializer.js"
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
export function useAsyncLocalStorage(prefix?: string, serializer?: Serializer) {
  const storage = useRef<AsyncLocalStorage>()

  if (storage.current === undefined)
    storage.current = new AsyncLocalStorage(prefix, serializer)

  useEffect(() => () => {
    storage.current?.unmount()
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
  readonly async = true
  readonly keys = new Set<string>()
  readonly onunload?: () => void

  constructor(
    readonly prefix = "xswr:",
    readonly serializer: Serializer = JSON
  ) {
    if (typeof Storage === "undefined")
      return
    this.onunload = () => this.collect()
    addEventListener("beforeunload", this.onunload)
  }

  unmount() {
    if (typeof Storage === "undefined")
      return
    if (this.onunload)
      removeEventListener("beforeunload", this.onunload);
    (async () => this.collect())().catch(console.error)
  }

  collect() {
    if (typeof Storage === "undefined")
      return
    for (const key of this.keys) {
      const state = this.getSync<State>(key, true)
      if (state?.expiration === undefined) continue
      if (state.expiration > Date.now()) continue
      this.delete(key, false)
    }
  }

  getSync<T = any>(key: string, ignore = false) {
    if (typeof Storage === "undefined")
      return
    if (!ignore && !this.keys.has(key))
      this.keys.add(key)
    const item = localStorage.getItem(this.prefix + key)
    if (item) return this.serializer.parse(item) as T
  }

  async get<T = any>(key: string, ignore = false) {
    if (typeof Storage === "undefined")
      return
    if (!ignore && !this.keys.has(key))
      this.keys.add(key)
    const item = localStorage.getItem(this.prefix + key)
    if (item) return this.serializer.parse(item) as T
  }

  async set<T = any>(key: string, value: T, ignore = false) {
    if (typeof Storage === "undefined")
      return
    if (!ignore && !this.keys.has(key))
      this.keys.add(key)
    const item = this.serializer.stringify(value)
    localStorage.setItem(this.prefix + key, item)
  }

  async delete(key: string, ignore = false) {
    if (typeof Storage === "undefined")
      return
    if (!ignore && this.keys.has(key))
      this.keys.delete(key)
    localStorage.removeItem(this.prefix + key)
  }
}