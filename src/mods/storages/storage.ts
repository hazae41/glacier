import { Optional } from "@hazae41/option"
import { Promiseable } from "libs/promises/promises.js"
import { StoredState } from "mods/types/state.js"

export interface Storage {

  /**
   * Get the data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get(key: string): Promiseable<Optional<StoredState<unknown, unknown>>>

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set(key: string, value: StoredState<unknown, unknown>): Promiseable<void>

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete(key: string): Promiseable<void>

}