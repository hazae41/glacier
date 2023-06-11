import { Option } from "@hazae41/option"
import { Result } from "@hazae41/result"
import { State } from "index.js"
import { Mutator } from "mods/types/mutator.js"

export interface Query<D = unknown, K = unknown> {
  /**
   * Arbitrary key, must be serializable
   */
  key?: K

  /**
   * Cache key, the serialized version of key
   */
  cacheKey?: string,

  /**
   * Data (or previous data if current error is some) (can be fake)
   */
  data: Option<D>

  /**
   * Error (can be fake)
   */
  error: Option<unknown>

  real: {
    /**
     * Real data (or previous real data if real error is some)
     */
    data: Option<D>

    /**
     * Real error
     */
    error: Option<unknown>
  }

  fake: {
    /**
     * Fake data (or previous fake data if fake error is some)
     */
    data: Option<D>

    /**
     * Fake error
     */
    error: Option<unknown>
  }

  /**
   * True if a fetch is ongoing (except those from update())
   */
  fetching: boolean

  /**
   * Abort controller, can be used to abort and check for abortion, present when a fetch is ongoing (except those from update())
   */
  aborter?: AbortController,

  /**
   * Use this to check if the state has been loaded from async storage and is ready to be used
   */
  ready: boolean

  /**
   * - Whether the data is from an optimistic update
   * - Whether the ongoing request is an optimistic update
   */
  optimistic?: boolean,

  /**
   * The last time this resource was mutated
   */
  time?: number

  /**
   * Expiration time of this resource, if any, may be useful for fetching just before the resource becomes stale
   */
  expiration?: number

  /**
   * Cooldown time of this resource, if any, may be useful for NOT fetching until it's over
   */
  cooldown?: number

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(aborter?: AbortController): Promise<Result<State<D>, Error>>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<Result<State<D>, Error>>

  /**
   * Mutate the cache
   * @param res 
   */
  mutate(mutator: Mutator<D>): Promise<Result<State<D>, Error>>

  /**
   * Clear the cache
   */
  clear(): Promise<Result<State<D>, Error>>

  /**
   * Suspend until the next state change, also launches an undeduped fetch
   */
  suspend(): Promise<Result<State<D>, Error>>

}