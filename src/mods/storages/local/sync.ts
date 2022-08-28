import { useRef } from "react"
import { State, SyncStorage } from "../storage"

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
export function useSyncLocalStorage() {
  const storage = useRef<SyncLocalStorage>()

  if (!storage.current)
    storage.current = new SyncLocalStorage()

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
export class SyncLocalStorage implements SyncStorage<State> {
  readonly async = false

  constructor() { }

  has(key: string) {
    if (typeof Storage === "undefined")
      return
    return Boolean(localStorage.getItem(key))
  }

  get(key: string): State {
    if (typeof Storage === "undefined")
      return
    const item = localStorage.getItem(key)
    if (item) return JSON.parse(item)
  }

  set(key: string, state: State) {
    if (typeof Storage === "undefined")
      return
    const { data, time, expiration } = state

    const item = JSON.stringify({ data, time, expiration })
    localStorage.setItem(key, item)
  }

  delete(key: string): Promise<void> {
    if (typeof Storage === "undefined")
      return
    localStorage.removeItem(key)
  }
}