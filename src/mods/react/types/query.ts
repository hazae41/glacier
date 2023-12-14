import { Nullable, Option } from "@hazae41/option"
import { Data } from "mods/fetched/data.js"
import { Fail } from "mods/fetched/fail.js"
import { Fetched } from "mods/fetched/fetched.js"
import { Mutator } from "mods/types/mutator.js"
import { FetcherfulQuerySettings, FetcherlessQuerySettings, SkeletonQuerySettings } from "mods/types/settings.js"
import { FetchedState, State } from "mods/types/state.js"

export type ReactQuery<K, D, F> =
  | SkeletonReactQuery<K, D, F>
  | FetcherfulReactQuery<K, D, F>
  | FetcherlessReactQuery<K, D, F>

export interface SkeletonReactQuery<K, D, F> extends Omit<SkeletonQuerySettings<K, D, F>, "time" | "cooldown" | "expiration"> {

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
  readonly aborter?: Nullable<never>,

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
  mutate(mutator: Mutator<D, F>): Promise<never>

  /**
   * Clear the cache
   */
  clear(): Promise<never>

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(aborter?: AbortController): Promise<never>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<never>

  /**
   * Suspend until the next state change, also launches an undeduped fetch
   */
  suspend(): Promise<never>

}

export interface FetcherfulReactQuery<K, D, F> extends Omit<FetcherfulQuerySettings<K, D, F>, "time" | "cooldown" | "expiration"> {

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
  readonly aborter?: Nullable<AbortController>,

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
  mutate(mutator: Mutator<D, F>): Promise<State<D, F>>

  /**
   * Clear the cache
   */
  clear(): Promise<State<D, F>>

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(aborter?: AbortController): Promise<Option<State<D, F>>>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<State<D, F>>

  /**
   * Suspend until the next state change, also launches an undeduped fetch
   */
  suspend(): Promise<State<D, F>>

}

export interface FetcherlessReactQuery<K, D, F> extends Omit<FetcherlessQuerySettings<K, D, F>, "time" | "cooldown" | "expiration"> {

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
  readonly aborter?: Nullable<AbortController>,

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
  mutate(mutator: Mutator<D, F>): Promise<State<D, F>>

  /**
   * Clear the cache
   */
  clear(): Promise<State<D, F>>

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(aborter?: AbortController): Promise<never>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<never>

  /**
   * Suspend until the next state change, also launches an undeduped fetch
   */
  suspend(): Promise<never>

}