import { Serializer } from "mods/types/serializer"
import { State } from "mods/types/state"
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
export class SyncLocalStorage implements SyncStorage<State> {
  readonly async = false

  constructor(
    readonly serializer: Serializer = JSON
  ) { }

  has(key: string) {
    if (typeof Storage === "undefined")
      return
    return Boolean(localStorage.getItem(key))
  }

  get(key: string): State {
    if (typeof Storage === "undefined")
      return
    const item = localStorage.getItem(key)
    if (item) return this.serializer.parse(item)
  }

  set(key: string, state: State) {
    if (typeof Storage === "undefined")
      return
    const { data, time, cooldown, expiration } = state
    const item = this.serializer.stringify({ data, time, cooldown, expiration })
    localStorage.setItem(key, item)
  }

  delete(key: string): Promise<void> {
    if (typeof Storage === "undefined")
      return
    localStorage.removeItem(key)
  }
}