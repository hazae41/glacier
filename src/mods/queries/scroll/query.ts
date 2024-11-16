import { Nullable, Some } from "@hazae41/option";
import { Err, Fallback, Ok } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { shouldUseCacheIfFresh, shouldUseCacheIfStale } from "libs/request/index.js";
import { AbortSignals } from "libs/signals/index.js";
import { Time } from "libs/time/time.js";
import { MissingFetcherError, core } from "mods/core/core.js";
import { Fetched } from "mods/fetched/fetched.js";
import { ScrollableFetcherfulReactQuery, ScrollableFetcherlessReactQuery, ScrollableSkeletonReactQuery } from "mods/react/hooks/queries/scroll.js";
import { Mutator } from "mods/types/mutator.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { ScrollableFetcherfulQuerySettings, ScrollableFetcherlessQuerySettings, ScrollableQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Scrollable } from "./helper.js";

export function createScrollableQuery<K, D, F>(
  settings: ScrollableFetcherfulQuerySettings<K, D, F>,
): ScrollableFetcherfulQuery<K, D, F>

export function createScrollableQuery<K, D, F>(
  settings: ScrollableFetcherlessQuerySettings<K, D, F>,
): ScrollableFetcherlessQuery<K, D, F>

export function createScrollableQuery<K, D, F>(
  settings: ScrollableQuerySettings<K, D, F>,
): ScrollableQuery<K, D, F>

export function createScrollableQuery<K, D, F>(
  settings: ScrollableQuerySettings<K, D, F>,
) {
  if (settings.fetcher == null)
    return new ScrollableFetcherlessQuery<K, D, F>(settings)
  return new ScrollableFetcherfulQuery<K, D, F>(settings)
}

export type ScrollableQuery<K, D, F> =
  | ScrollableFetcherfulQuery<K, D, F>
  | ScrollableFetcherlessQuery<K, D, F>

export namespace ScrollableQuery {
  export type Infer<T> =
    | undefined
    | ScrollableFetcherlessQuery.Infer<T>
    | ScrollableFetcherfulQuery.Infer<T>

  export type K<T> =
    | ScrollableFetcherfulQuery.K<T>
    | ScrollableFetcherlessQuery.K<T>

  export type D<T> =
    | ScrollableFetcherfulQuery.D<T>
    | ScrollableFetcherlessQuery.D<T>

  export type F<T> =
    | ScrollableFetcherfulQuery.F<T>
    | ScrollableFetcherlessQuery.F<T>

  export type Reactify<T> =
    | ScrollableFetcherfulQuery.Reactify<T>
    | ScrollableFetcherlessQuery.Reactify<T>

  export type ReactifyAndSkeleton<T> =
    | ScrollableSkeletonReactQuery<K<T>, D<T>, F<T>>
    | Reactify<T>

  export type ReactifyOrSkeleton<T> =
    [T, undefined] extends [undefined, T] ? ScrollableSkeletonReactQuery<any, any, any> :
    undefined extends T ? ReactifyAndSkeleton<T> : Reactify<T>
}

export namespace ScrollableFetcherlessQuery {
  export type Infer<T> = ScrollableFetcherlessQuery<K<T>, D<T>, F<T>>

  export type Reactify<T> = T extends ScrollableFetcherlessQuery<infer K, infer D, infer F> ? ScrollableFetcherlessReactQuery<K, D, F> : never

  export type K<T> = T extends ScrollableFetcherlessQuery<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends ScrollableFetcherlessQuery<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends ScrollableFetcherlessQuery<infer _K, infer _D, infer F> ? F : never
}

export namespace ScrollableFetcherfulQuery {
  export type Infer<T> = ScrollableFetcherfulQuery<K<T>, D<T>, F<T>>

  export type Reactify<T> = T extends ScrollableFetcherfulQuery<infer K, infer D, infer F> ? ScrollableFetcherfulReactQuery<K, D, F> : never

  export type K<T> = T extends ScrollableFetcherfulQuery<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends ScrollableFetcherfulQuery<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends ScrollableFetcherfulQuery<infer _K, infer _D, infer F> ? F : never
}

export class ScrollableFetcherfulQuery<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: ScrollableFetcherfulQuerySettings<K, D, F>
  ) {
    this.cacheKey = Scrollable.getCacheKey(settings.key)
  }

  get state() {
    return core.getOrThrow(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async mutateOrThrow(mutator: Mutator<D[], F>): Promise<State<D[], F>> {
    return await core.mutateOrThrow(this.cacheKey, mutator, this.settings)
  }

  async deleteOrThrow(): Promise<State<D[], F>> {
    return await core.deleteOrThrow(this.cacheKey, this.settings)
  }

  async normalizeOrThrow(fetched: Nullable<Fetched<D[], F>>, more: NormalizerMore): Promise<void> {
    if (more.shallow)
      return
    await this.mutateOrThrow(() => new Some(fetched))
  }

  async fetchOrThrow(init?: RequestInit): Promise<Fallback<State<D[], F>>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state.real?.current.cooldown))
      return new Err(state)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state.real?.current.expiration))
      return new Err(state)

    const aborter = new AbortController()
    const signal = AbortSignal.any([aborter.signal, AbortSignals.getOrNever(init?.signal)])

    return new Ok(await core.runOrJoin(cacheKey, aborter, () => Scrollable.fetchOrThrow(cacheKey, signal, settings)))
  }

  async refetchOrThrow(init?: RequestInit): Promise<Fallback<State<D[], F>>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state.real?.current.cooldown))
      return new Err(state)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state.real?.current.expiration))
      return new Err(state)

    const aborter = new AbortController()
    const signal = AbortSignal.any([aborter.signal, AbortSignals.getOrNever(init?.signal)])

    return new Ok(await core.runOrReplace(cacheKey, aborter, () => Scrollable.fetchOrThrow(cacheKey, signal, settings)))
  }

  async scrollOrThrow(init?: RequestInit): Promise<Fallback<State<D[], F>>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state.real?.current.cooldown))
      return new Err(state)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state.real?.current.expiration))
      return new Err(state)

    const aborter = new AbortController()
    const signal = AbortSignal.any([aborter.signal, AbortSignals.getOrNever(init?.signal)])

    return new Ok(await core.runOrReplace(cacheKey, aborter, () => Scrollable.scrollOrThrow(cacheKey, signal, settings)))
  }

  async peekOrNull(): Promise<Nullable<K>> {
    const { settings } = this
    const state = await this.state
    const pages = state.real?.data?.inner

    if (pages == null)
      return undefined

    return settings.scroller(Arrays.last(pages))
  }

}

export class ScrollableFetcherlessQuery<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: ScrollableFetcherlessQuerySettings<K, D, F>
  ) {
    this.cacheKey = Scrollable.getCacheKey(settings.key)
  }

  get state() {
    return core.getOrThrow(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async mutateOrThrow(mutator: Mutator<D[], F>): Promise<State<D[], F>> {
    return await core.mutateOrThrow(this.cacheKey, mutator, this.settings)
  }

  async deleteOrThrow(): Promise<State<D[], F>> {
    return await core.deleteOrThrow(this.cacheKey, this.settings)
  }

  async normalizeOrThrow(fetched: Nullable<Fetched<D[], F>>, more: NormalizerMore) {
    if (more.shallow)
      return
    await this.mutateOrThrow(() => new Some(fetched))
  }

  async fetchOrThrow(init?: RequestInit): Promise<never> {
    throw new MissingFetcherError()
  }

  async refetchOrThrow(init?: RequestInit): Promise<never> {
    throw new MissingFetcherError()
  }

  async scrollOrThrow(init?: RequestInit): Promise<never> {
    throw new MissingFetcherError()
  }

  async peekOrNull(): Promise<Nullable<K>> {
    const { settings } = this
    const state = await this.state
    const pages = state.real?.data?.inner

    if (pages == null)
      return undefined

    return settings.scroller(Arrays.last(pages))
  }

}