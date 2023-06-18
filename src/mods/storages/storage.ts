import { Optional } from "@hazae41/option"
import { Ortho } from "libs/ortho/ortho.js"
import { Promiseable } from "libs/promises/promises.js"
import { RawState } from "mods/types/state.js"

export interface Storage {

  readonly onState?: Ortho<RawState>

  /**
   * Get the data from the given key
   * @param cacheKey the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get?(cacheKey: string): Promiseable<Optional<RawState>>

  /**
   * Set the given data to the given key
   * @param cacheKey the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set?(cacheKey: string, value: Optional<RawState>): Promiseable<void>

}