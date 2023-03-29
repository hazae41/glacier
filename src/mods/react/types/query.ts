import { Mutator } from "mods/types/mutator.js"
import { State } from "mods/types/state.js"

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
   * Data, if any
   */
  data?: D

  /**
   * Data, if any, but not optimistic
   */
  realData?: D

  /**
   * Error, if any
   */
  error?: unknown

  /**
   * Shorthand for Boolean(aborter), use this to check if a fetch is ongoing (except those from update())
   */
  loading: boolean

  /**
   * Use this to check if the state has been loaded from async storage and is ready to be used
   */
  ready: boolean

  /**
   * The last time this resource was mutated, if any
   */
  time?: number

  /**
   * Abort controller, can be used to abort and check for abortion, present when a fetch is ongoing (except those from update())
   */
  aborter?: AbortController,

  /**
   * - Whether the data is from an optimistic update
   * - Whether the ongoing request is an optimistic update
   */
  optimistic?: boolean,

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
  fetch(aborter?: AbortController): Promise<State<D> | undefined>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<State<D> | undefined>

  /**
   * Mutate the cache
   * @param res 
   */
  mutate(mutator: Mutator<D>): Promise<State<D> | undefined>

  /**
   * Clear the cache
   */
  clear(): void

  /**
   * Suspend until the next state change, also launches an undeduped fetch
   */
  suspend(): Promise<void>
}