import { Serializer } from "mods/types/serializer"
import { AsyncStorage } from "mods/types/storage"
import { useRef } from "react"

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
export function useAsyncLocalStorage(serializer?: Serializer) {
  const storage = useRef<AsyncLocalStorage>()

  if (!storage.current)
    storage.current = new AsyncLocalStorage(serializer)

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

  constructor(
    readonly serializer: Serializer = JSON
  ) { }

  async get<T = any>(key: string) {
    if (typeof Storage === "undefined")
      return
    const item = localStorage.getItem(key)
    if (item) return this.serializer.parse(item) as T
  }

  async set<T = any>(key: string, value: T) {
    if (typeof Storage === "undefined")
      return
    const item = this.serializer.stringify(value)
    localStorage.setItem(key, item)
  }

  async delete(key: string) {
    if (typeof Storage === "undefined")
      return
    localStorage.removeItem(key)
  }
}