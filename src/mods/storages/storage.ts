import { Nullable } from "@hazae41/option"
import { Result } from "@hazae41/result"
import { CustomEventTarget } from "libs/ortho/ortho.js"
import { Promiseable } from "libs/promises/promises.js"
import { RawState } from "mods/types/state.js"

export interface Storage {

  readonly onState?: CustomEventTarget<RawState>

  /**
   * Get the data from the given key
   * @param cacheKey the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  tryGet?(cacheKey: string): Promiseable<Result<Nullable<RawState>, Error>>

  /**
   * Set the given data to the given key
   * @param cacheKey the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  trySet?(cacheKey: string, value: Nullable<RawState>): Promiseable<Result<void, Error>>

}