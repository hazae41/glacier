import { useRef } from "react"
import { AsyncStorage, State } from "../storage"

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
export function useAsyncLocalStorage() {
  const storage = useRef<AsyncLocalStorage>()

  if (!storage.current)
    storage.current = new AsyncLocalStorage()

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
export class AsyncLocalStorage implements AsyncStorage<State> {
  readonly async = true

  constructor() { }

  async has(key: string) {
    if (typeof Storage === "undefined")
      return
    return Boolean(localStorage.getItem(key))
  }

  async get(key: string): Promise<State> {
    if (typeof Storage === "undefined")
      return
    const item = localStorage.getItem(key)
    if (item) return JSON.parse(item)
  }

  async set(key: string, state: State) {
    if (typeof Storage === "undefined")
      return
    const { data, time, expiration } = state

    const item = JSON.stringify({ data, time, expiration })
    localStorage.setItem(key, item)
  }

  async delete(key: string): Promise<void> {
    if (typeof Storage === "undefined")
      return
    localStorage.removeItem(key)
  }
}