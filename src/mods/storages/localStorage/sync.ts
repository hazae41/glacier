import { Serializer } from "mods/types/serializer"
import { SyncStorage } from "mods/types/storage"
import { useRef } from "react"

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
export function useSyncLocalStorage(serializer?: Serializer) {
  const storage = useRef<SyncLocalStorage>()

  if (!storage.current)
    storage.current = new SyncLocalStorage(serializer)

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

  constructor(
    readonly serializer: Serializer = JSON
  ) { }

  get<T = any>(key: string) {
    if (typeof Storage === "undefined")
      return
    const item = localStorage.getItem(key)
    if (item) return this.serializer.parse(item) as T
  }

  set<T = any>(key: string, value: T) {
    if (typeof Storage === "undefined")
      return
    const item = this.serializer.stringify(value)
    localStorage.setItem(key, item)
  }

  delete(key: string) {
    if (typeof Storage === "undefined")
      return
    localStorage.removeItem(key)
  }
}