import { Awaitable } from "libs/promises/promises.js"
import { RawState } from "mods/types/state.js"

export interface QueryStorage {

  /**
   * Get the data from the given key
   * @param cacheKey the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  getOrThrow?(cacheKey: string): Awaitable<RawState>

  /**
   * Set the given data to the given key
   * @param cacheKey the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  setOrThrow?(cacheKey: string, value: RawState): Awaitable<void>

}