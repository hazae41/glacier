import { QueryStorage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"
import { Fetcher } from "./fetcher.js"
import { Indexer } from "./indexer.js"
import { Scroller } from "./scroller.js"

export type QuerySettings<K, D, F> =
  | SkeletonQuerySettings<K, D, F>
  | FetcherfulQuerySettings<K, D, F>
  | FetcherlessQuerySettings<K, D, F>

export type KeyedQuerySettings<K, D, F> =
  | FetcherfulQuerySettings<K, D, F>
  | FetcherlessQuerySettings<K, D, F>

export interface SkeletonQuerySettings<K, D, F> {
  /**
   * Arbitrary key, must be JSON-serializable
   */
  readonly key?: K

  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly fetcher?: Fetcher<K, D, F>
  readonly normalizer?: Normalizer<D, F>
  readonly indexer?: Indexer<D, F>

  readonly storage?: QueryStorage
}

export interface FetcherfulQuerySettings<K, D, F> {
  /**
   * Arbitrary key, must be JSON-serializable
   */
  readonly key: K

  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly fetcher: Fetcher<K, D, F>
  readonly normalizer?: Normalizer<D, F>
  readonly indexer?: Indexer<D, F>

  readonly storage?: QueryStorage
}

export interface FetcherlessQuerySettings<K, D, F> {
  /**
   * Arbitrary key, must be JSON-serializable
   */
  readonly key: K

  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly fetcher?: undefined
  readonly normalizer?: Normalizer<D, F>
  readonly indexer?: Indexer<D, F>

  readonly storage?: QueryStorage
}

export type ScrollableQuerySettings<K, D, F> =
  | ScrollableFetcherlessQuerySettings<K, D, F>
  | ScrollableFetcherfulQuerySettings<K, D, F>

export interface ScrollableFetcherlessQuerySettings<K, D, F> extends FetcherlessQuerySettings<K, D[], F> {
  readonly scroller: Scroller<K, D, F>
}

export interface ScrollableFetcherfulQuerySettings<K, D, F> extends FetcherfulQuerySettings<K, D[], F> {
  readonly scroller: Scroller<K, D, F>
}