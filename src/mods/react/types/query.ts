import { Result } from "@hazae41/result"
import { CooldownError, MissingFetcherError, MissingKeyError } from "mods/core/core.js"
import { Data } from "mods/result/data.js"
import { Fail } from "mods/result/fail.js"
import { Fetched } from "mods/result/fetched.js"
import { FetchError } from "mods/types/fetcher.js"
import { Mutator } from "mods/types/mutator.js"
import { FetcherfulQuerySettings, FetcherlessQuerySettings, SkeletonQuerySettings } from "mods/types/settings.js"
import { FetchedState, State } from "mods/types/state.js"

export type Query<K, D, F> =
  | FetcherfulQuery<K, D, F>
  | FetcherlessQuery<K, D, F>

export interface SkeletonQuery<K, D, F> extends Omit<SkeletonQuerySettings<K, D, F>, "time" | "cooldown" | "expiration"> {

  /**
   * Cache key, the serialized version of key
   */
  readonly cacheKey?: undefined,

  /**
   * Current data or error (can be fake)
   */
  readonly current?: undefined

  /**
   * Data (or previous data if current error is some) (can be fake or fakely undefined)
   */
  readonly data?: undefined

  /**
   * Error (can be fake or fakely undefined)
   */
  readonly error?: undefined

  /**
   * Real state
   */
  readonly real?: undefined

  /**
   * Fake state (can be fakely undefined)
   */
  readonly fake?: undefined

  /**
   * True if a fetch is ongoing (except those from update())
   */
  readonly fetching?: false

  /**
   * Abort controller, can be used to abort and check for abortion, present when a fetch is ongoing (except those from update())
   */
  readonly aborter?: undefined,

  /**
   * Use this to check if the state has been loaded from async storage and is ready to be used
   */
  readonly ready?: false

  /**
   * True if it's in a fake state
   */
  readonly optimistic?: false,

  /**
   * Mutate the cache
   * @param res 
   */
  mutate(mutator: Mutator<D, F>): Promise<Result<never, MissingKeyError>>

  /**
   * Clear the cache
   */
  clear(): Promise<Result<never, MissingKeyError>>

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(aborter?: AbortController): Promise<Result<never, MissingKeyError>>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<Result<never, MissingKeyError>>

  /**
   * Suspend until the next state change, also launches an undeduped fetch
   */
  suspend(): Promise<Result<never, MissingKeyError>>

}

export interface FetcherfulQuery<K, D, F> extends Omit<FetcherfulQuerySettings<K, D, F>, "time" | "cooldown" | "expiration"> {

  /**
   * Cache key, the serialized version of key
   */
  readonly cacheKey?: string,

  /**
   * Current data or error (can be fake)
   */
  readonly current?: Fetched<D, F>

  /**
   * Data (or previous data if current error is some) (can be fake or fakely undefined)
   */
  readonly data?: Data<D>

  /**
   * Error (can be fake or fakely undefined)
   */
  readonly error?: Fail<F>

  /**
   * Real state
   */
  readonly real?: FetchedState<D, F>

  /**
   * Fake state (can be fakely undefined)
   */
  readonly fake?: FetchedState<D, F>

  /**
   * True if a fetch is ongoing (except those from update())
   */
  readonly fetching?: boolean

  /**
   * Abort controller, can be used to abort and check for abortion, present when a fetch is ongoing (except those from update())
   */
  readonly aborter?: AbortController,

  /**
   * Use this to check if the state has been loaded from async storage and is ready to be used
   */
  readonly ready?: boolean

  /**
   * True if it's in a fake state
   */
  readonly optimistic?: boolean,

  /**
   * Mutate the cache
   * @param res 
   */
  mutate(mutator: Mutator<D, F>): Promise<Result<State<D, F>, never>>

  /**
   * Clear the cache
   */
  clear(): Promise<Result<State<D, F>, never>>

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(aborter?: AbortController): Promise<Result<Result<Result<Result<State<D, F>, FetchError>, CooldownError>, never>, never>>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<Result<Result<Result<State<D, F>, FetchError>, never>, never>>

  /**
   * Suspend until the next state change, also launches an undeduped fetch
   */
  suspend(): Promise<Result<Result<Result<State<D, F>, FetchError>, never>, never>>

}

export interface FetcherlessQuery<K, D, F> extends Omit<FetcherlessQuerySettings<K, D, F>, "time" | "cooldown" | "expiration"> {

  /**
   * Cache key, the serialized version of key
   */
  readonly cacheKey?: string,

  /**
   * Current data or error (can be fake)
   */
  readonly current?: Fetched<D, F>

  /**
   * Data (or previous data if current error is some) (can be fake or fakely undefined)
   */
  readonly data?: Data<D>

  /**
   * Error (can be fake or fakely undefined)
   */
  readonly error?: Fail<F>

  /**
   * Real state
   */
  readonly real?: FetchedState<D, F>

  /**
   * Fake state (can be fakely undefined)
   */
  readonly fake?: FetchedState<D, F>

  /**
   * True if a fetch is ongoing (except those from update())
   */
  readonly fetching?: boolean

  /**
   * Abort controller, can be used to abort and check for abortion, present when a fetch is ongoing (except those from update())
   */
  readonly aborter?: AbortController,

  /**
   * Use this to check if the state has been loaded from async storage and is ready to be used
   */
  readonly ready?: boolean

  /**
   * True if it's in a fake state
   */
  readonly optimistic?: boolean,

  /**
   * Mutate the cache
   * @param res 
   */
  mutate(mutator: Mutator<D, F>): Promise<Result<State<D, F>, never>>

  /**
   * Clear the cache
   */
  clear(): Promise<Result<State<D, F>, never>>

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(aborter?: AbortController): Promise<Result<Result<never, MissingFetcherError>, never>>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<Result<Result<never, MissingFetcherError>, never>>

  /**
   * Suspend until the next state change, also launches an undeduped fetch
   */
  suspend(): Promise<Result<Result<never, MissingFetcherError>, never>>

}