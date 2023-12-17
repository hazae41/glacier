import { Nullable, Some } from "@hazae41/option";
import { Err, Ok } from "@hazae41/result";
import { Fallback } from "index.js";
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

  export type Reactify<T> =
    | SimpleSkeletonQuery.Reactify<T>
    | SimpleFetcherlessQuery.Reactify<T>
    | SimpleFetcherfulQuery.Reactify<T>
}

export namespace SimpleSkeletonQuery {
  export type Reactify<T> = T extends undefined ? SimpleSkeletonReactQuery<any, any, any> : never
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

  async mutate(mutator: Mutator<D, F>): Promise<State<D, F>> {
    return await core.mutateOrThrow(this.cacheKey, mutator, this.settings)
  }

  async delete(): Promise<State<D, F>> {
    return await core.deleteOrThrow(this.cacheKey, this.settings)
  }

  async normalize(fetched: Nullable<Fetched<D, F>>, more: NormalizerMore): Promise<void> {
    if (more.shallow)
      return
    await this.mutate(() => new Some(fetched))
  }

  async fetch(aborter = new AbortController()): Promise<never> {
    throw new MissingFetcherError()
  }

  async refetch(aborter = new AbortController()): Promise<never> {
    throw new MissingFetcherError()
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<never> {
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

  async mutate(mutator: Mutator<D, F>): Promise<State<D, F>> {
    return await core.mutateOrThrow(this.cacheKey, mutator, this.settings)
  }

  async delete(): Promise<State<D, F>> {
    return await core.deleteOrThrow(this.cacheKey, this.settings)
  }

  async normalize(fetched: Nullable<Fetched<D, F>>, more: NormalizerMore): Promise<void> {
    if (more.shallow)
      return
    await this.mutate(() => new Some(fetched))
  }

  async fetch(aborter = new AbortController()): Promise<Fallback<State<D, F>>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (Time.isAfterNow(state.real?.current.cooldown))
      return new Err(state)

    return new Ok(await core.runOrJoin(cacheKey, aborter, () => Simple.fetchOrThrow(cacheKey, aborter, settings)))
  }

  async refetch(aborter = new AbortController()): Promise<State<D, F>> {
    const { cacheKey, settings } = this

    return await core.runOrReplace(cacheKey, aborter, () => Simple.fetchOrThrow(cacheKey, aborter, settings))
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<State<D, F>> {
    const { cacheKey, settings } = this

    return await Simple.updateOrThrow(cacheKey, updater, aborter, settings)
  }

}