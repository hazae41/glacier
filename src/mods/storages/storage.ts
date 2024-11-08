import { Awaitable } from "libs/promises/promises.js"
import { RawState } from "mods/types/state.js"

export interface QueryStorage {

  /**
   * Get the data from the given key
   * @param cacheKey the given key
   * @returns 
   */
  getOrThrow(cacheKey: string): Awaitable<RawState>

  /**
   * Set the given data to the given key
   * @param cacheKey the given key
   * @param value the given data
   * @returns 
   */
  setOrThrow(cacheKey: string, value: RawState): Awaitable<void>

}
