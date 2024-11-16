import { Nullable, Some } from "@hazae41/option";
import { Err, Ok } from "@hazae41/result";
import { Fallback } from "index.js";
import { shouldUseCacheIfFresh, shouldUseCacheIfStale } from "libs/request/index.js";
import { AbortSignals } from "libs/signals/index.js";
import { Time } from "libs/time/time.js";
import { MissingFetcherError, core } from "mods/core/core.js";
import { Fetched } from "mods/fetched/fetched.js";
import { SimpleFetcherfulReactQuery, SimpleFetcherlessReactQuery, SimpleSkeletonReactQuery } from "mods/react/hooks/queries/simple.js";
import { Mutator } from "mods/types/mutator.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings, KeyedQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { Simple } from "./helper.js";

export function createQuery<K, D, F>(
  settings: FetcherlessQuerySettings<K, D, F>
): SimpleFetcherlessQuery<K, D, F>

export function createQuery<K, D, F>(
  settings: FetcherfulQuerySettings<K, D, F>
): SimpleFetcherfulQuery<K, D, F>

export function createQuery<K, D, F>(
  settings: KeyedQuerySettings<K, D, F>,
): SimpleQuery<K, D, F>

export function createQuery<K, D, F>(
  settings: KeyedQuerySettings<K, D, F>,
) {
  if (settings.fetcher == null)
    return new SimpleFetcherlessQuery<K, D, F>(settings)
  else
    return new SimpleFetcherfulQuery<K, D, F>(settings)
}

export type SimpleQuery<K, D, F> =
  | SimpleFetcherlessQuery<K, D, F>
  | SimpleFetcherfulQuery<K, D, F>

export namespace SimpleQuery {
  export type Infer<T> =
    | undefined
    | SimpleFetcherlessQuery.Infer<T>
    | SimpleFetcherfulQuery.Infer<T>

  export type K<T> =
    | SimpleFetcherfulQuery.K<T>
    | SimpleFetcherlessQuery.K<T>

  export type D<T> =
    | SimpleFetcherfulQuery.D<T>
    | SimpleFetcherlessQuery.D<T>

  export type F<T> =
    | SimpleFetcherfulQuery.F<T>
    | SimpleFetcherlessQuery.F<T>

  export type Reactify<T> =
    | SimpleFetcherfulQuery.Reactify<T>
    | SimpleFetcherlessQuery.Reactify<T>

  export type ReactifyAndSkeleton<T> =
    | SimpleSkeletonReactQuery<K<T>, D<T>, F<T>>
    | Reactify<T>

  export type ReactifyOrSkeleton<T> =
    [T, undefined] extends [undefined, T] ? SimpleSkeletonReactQuery<any, any, any> :
    undefined extends T ? ReactifyAndSkeleton<T> : Reactify<T>
}

export namespace SimpleFetcherlessQuery {
  export type Infer<T> = SimpleFetcherlessQuery<K<T>, D<T>, F<T>>

  export type Reactify<T> = T extends SimpleFetcherlessQuery<infer K, infer D, infer F> ? SimpleFetcherlessReactQuery<K, D, F> : never

  export type K<T> = T extends SimpleFetcherlessQuery<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends SimpleFetcherlessQuery<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends SimpleFetcherlessQuery<infer _K, infer _D, infer F> ? F : never
}

export namespace SimpleFetcherfulQuery {
  export type Infer<T> = SimpleFetcherfulQuery<K<T>, D<T>, F<T>>

  export type Reactify<T> = T extends SimpleFetcherfulQuery<infer K, infer D, infer F> ? SimpleFetcherfulReactQuery<K, D, F> : never

  export type K<T> = T extends SimpleFetcherfulQuery<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends SimpleFetcherfulQuery<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends SimpleFetcherfulQuery<infer _K, infer _D, infer F> ? F : never
}

export class SimpleFetcherlessQuery<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: FetcherlessQuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(settings.key)
  }

  get state() {
    return core.getOrThrow(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async mutateOrThrow(mutator: Mutator<D, F>): Promise<State<D, F>> {
    return await core.mutateOrThrow(this.cacheKey, mutator, this.settings)
  }

  async deleteOrThrow(): Promise<State<D, F>> {
    return await core.deleteOrThrow(this.cacheKey, this.settings)
  }

  async normalizeOrThrow(fetched: Nullable<Fetched<D, F>>, more: NormalizerMore): Promise<void> {
    if (more.shallow)
      return
    await this.mutateOrThrow(() => new Some(fetched))
  }

  async fetchOrThrow(aborter = new AbortController()): Promise<never> {
    throw new MissingFetcherError()
  }

  async refetchOrThrow(aborter = new AbortController()): Promise<never> {
    throw new MissingFetcherError()
  }

  async updateOrThrow(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<never> {
    throw new MissingFetcherError()
  }

}

export class SimpleFetcherfulQuery<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: FetcherfulQuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(settings.key)
  }

  get state() {
    return core.getOrThrow(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async mutateOrThrow(mutator: Mutator<D, F>): Promise<State<D, F>> {
    return await core.mutateOrThrow(this.cacheKey, mutator, this.settings)
  }

  async deleteOrThrow(): Promise<State<D, F>> {
    return await core.deleteOrThrow(this.cacheKey, this.settings)
  }

  async normalizeOrThrow(fetched: Nullable<Fetched<D, F>>, more: NormalizerMore): Promise<void> {
    if (more.shallow)
      return
    await this.mutateOrThrow(() => new Some(fetched))
  }

  async fetchOrThrow(init?: RequestInit): Promise<Fallback<State<D, F>>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state.real?.current.cooldown))
      return new Err(state)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state.real?.current.expiration))
      return new Err(state)

    const aborter = new AbortController()
    const signal = AbortSignal.any([aborter.signal, AbortSignals.getOrNever(init?.signal)])

    return new Ok(await core.runOrJoin(cacheKey, aborter, () => Simple.fetchOrThrow(cacheKey, signal, settings)))
  }

  async refetchOrThrow(init?: RequestInit): Promise<Fallback<State<D, F>>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state.real?.current.cooldown))
      return new Err(state)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state.real?.current.expiration))
      return new Err(state)

    const aborter = new AbortController()
    const signal = AbortSignal.any([aborter.signal, AbortSignals.getOrNever(init?.signal)])

    return new Ok(await core.runOrReplace(cacheKey, aborter, () => Simple.fetchOrThrow(cacheKey, signal, settings)))
  }

  async updateOrThrow(updater: Updater<K, D, F>, init?: RequestInit): Promise<Fallback<State<D, F>>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state.real?.current.cooldown))
      return new Err(state)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state.real?.current.expiration))
      return new Err(state)

    const signal = AbortSignals.getOrNever(init?.signal)

    return new Ok(await Simple.updateOrThrow(cacheKey, updater, signal, settings))
  }

}