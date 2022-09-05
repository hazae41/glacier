import { Serializer } from "mods/types/serializer"
import { State } from "mods/types/state"
import { SyncStorage } from "mods/types/storage"
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
    storage.current = new SyncLocalStorage(prefix, serializer)

  useEffect(() => () => {
    storage.current!.unmount()
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
  readonly async = false
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
    removeEventListener("beforeunload", this.onunload!);
    (async () => this.collect())().catch(console.error)
  }

  collect() {
    if (typeof Storage === "undefined")
      return
    for (const key of this.keys) {
      const state = this.get<State>(key, true)
      if (state?.expiration === undefined) continue
      if (state.expiration > Date.now()) continue
      this.delete(key, false)
    }
  }

  get<T = any>(key: string, ignore = false) {
    if (typeof Storage === "undefined")
      return
    if (!ignore && !this.keys.has(key))
      this.keys.add(key)
    const item = localStorage.getItem(this.prefix + key)
    if (item) return this.serializer.parse(item) as T
  }

  set<T = any>(key: string, value: T, ignore = false) {
    if (typeof Storage === "undefined")
      return
    if (!ignore && !this.keys.has(key))
      this.keys.add(key)
    const item = this.serializer.stringify(value)
    localStorage.setItem(this.prefix + key, item)
  }

  delete(key: string, ignore = false) {
    if (typeof Storage === "undefined")
      return
    if (!ignore && this.keys.has(key))
      this.keys.delete(key)
    localStorage.removeItem(this.prefix + key)
  }
}