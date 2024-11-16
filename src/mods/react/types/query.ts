import { Nullable } from "@hazae41/option"
import { Fallback } from "@hazae41/result"
import { Bicoder, SyncEncoder } from "mods/coders/coder.js"
import { Equalser } from "mods/equals/equals.js"
import { Data } from "mods/fetched/data.js"
import { Fail } from "mods/fetched/fail.js"
import { Fetched } from "mods/fetched/fetched.js"
import { QueryStorage } from "mods/storages/storage.js"
import { Fetcher } from "mods/types/fetcher.js"
import { Indexer } from "mods/types/indexer.js"
import { Mutator } from "mods/types/mutator.js"
import { Normalizer } from "mods/types/normalizer.js"
import { FetcherfulQuerySettings, FetcherlessQuerySettings, SkeletonQuerySettings } from "mods/types/settings.js"
import { FetchedState, State } from "mods/types/state.js"

export interface ReactQueryLike<K, D, F> {
  readonly key?: K

  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly fetcher?: Fetcher<K, D, F>
  readonly normalizer?: Normalizer<D, F>
  readonly indexer?: Indexer<D, F>

  readonly keySerializer?: SyncEncoder<K, string>,

  readonly dataSerializer?: Bicoder<D, unknown>
  readonly errorSerializer?: Bicoder<F, unknown>

  readonly dataEqualser?: Equalser<D>,
  readonly errorEqualser?: Equalser<F>

  readonly storage?: QueryStorage

  readonly cacheKey?: string

  readonly current?: Fetched<D, F>

  readonly data?: Data<D>
  readonly error?: Fail<F>

  readonly real?: FetchedState<D, F>
  readonly fake?: FetchedState<D, F>

  readonly aborter?: Nullable<AbortController>

  readonly ready?: boolean
  readonly fetching?: boolean
  readonly optimistic?: boolean

  mutate(mutator: Mutator<D, F>): Promise<State<D, F>>

  clear(): Promise<State<D, F>>

  fetch(aborter?: AbortController): Promise<Fallback<State<D, F>>>

  refetch(aborter?: AbortController): Promise<State<D, F>>

  suspend(): Promise<State<D, F>>
}

export type ReactQuery<K, D, F> =
  | SkeletonReactQuery<K, D, F>
  | FetcherfulReactQuery<K, D, F>
  | FetcherlessReactQuery<K, D, F>

export interface SkeletonReactQuery<K, D, F> extends SkeletonQuerySettings<K, D, F> {

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
  mutateOrThrow(mutator: Mutator<D, F>): Promise<never>

  /**
   * Clear the cache
   */
  deleteOrThrow(): Promise<never>

  /**
   * Fetch or join the fetch if it's ongoing
   * @example You just want some fresh data
   */
  fetchOrThrow(init?: RequestInit): Promise<never>

  /**
   * Fetch or replace the fetch if it's ongoing
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some updated fresh data
   */
  refetchOrThrow(init?: RequestInit): Promise<never>

}

export interface FetcherfulReactQuery<K, D, F> extends FetcherfulQuerySettings<K, D, F> {

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
  mutateOrThrow(mutator: Mutator<D, F>): Promise<State<D, F>>

  /**
   * Clear the cache
   */
  deleteOrThrow(): Promise<State<D, F>>

  /**
   * Fetch or join the fetch if it's ongoing
   * @example You just want some fresh data
   */
  fetchOrThrow(init?: RequestInit): Promise<Fallback<State<D, F>>>

  /**
   * Fetch or replace the fetch if it's ongoing
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some updated fresh data
   */
  refetchOrThrow(init?: RequestInit): Promise<Fallback<State<D, F>>>

}

export interface FetcherlessReactQuery<K, D, F> extends FetcherlessQuerySettings<K, D, F> {

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
  mutateOrThrow(mutator: Mutator<D, F>): Promise<State<D, F>>

  /**
   * Clear the cache
   */
  deleteOrThrow(): Promise<State<D, F>>

  /**
   * Fetch or join the fetch if it's ongoing
   * @example You just want some fresh data
   */
  fetchOrThrow(init?: RequestInit): Promise<never>

  /**
   * Fetch or replace the fetch if it's ongoing
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some updated fresh data
   */
  refetchOrThrow(init?: RequestInit): Promise<never>

}