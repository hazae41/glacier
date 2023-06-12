import { Result } from "@hazae41/result"
import { Data } from "mods/result/data.js"
import { Fail } from "mods/result/fail.js"
import { Fetched } from "mods/result/fetched.js"
import { Mutator } from "mods/types/mutator.js"
import { FetchedState, State } from "mods/types/state.js"

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
   * Current data or error (can be fake)
   */
  current?: Fetched<D, unknown>

  /**
   * Data (or previous data if current error is some) (can be fake or fakely undefined)
   */
  data?: Data<D>

  /**
   * Error (can be fake or fakely undefined)
   */
  error?: Fail<unknown>

  /**
   * Real state
   */
  real?: FetchedState<D, unknown>

  /**
   * Fake state (can be fakely undefined)
   */
  fake?: FetchedState<D, unknown>

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
   * True if it's in a fake state
   */
  optimistic?: boolean,

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