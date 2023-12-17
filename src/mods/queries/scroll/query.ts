import { Nullable, Some } from "@hazae41/option";
import { Err, Ok } from "@hazae41/result";
import { Fallback } from "index.js";
import { Arrays } from "libs/arrays/arrays.js";
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

  export type Reactify<T> =
    | ScrollableSkeletonQuery.Reactify<T>
    | ScrollableFetcherlessQuery.Reactify<T>
    | ScrollableFetcherfulQuery.Reactify<T>
}

export namespace ScrollableSkeletonQuery {
  export type Reactify<T> = T extends undefined ? ScrollableSkeletonReactQuery<any, any, any> : never
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

  async peek(): Promise<Nullable<K>> {
    const { settings } = this
    const state = await this.state
    const pages = state.real?.data?.inner

    if (pages == null)
      return undefined

    return settings.scroller(Arrays.last(pages))
  }

  async mutate(mutator: Mutator<D[], F>): Promise<State<D[], F>> {
    return await core.mutateOrThrow(this.cacheKey, mutator, this.settings)
  }

  async delete(): Promise<State<D[], F>> {
    return await core.deleteOrThrow(this.cacheKey, this.settings)
  }

  async normalize(fetched: Nullable<Fetched<D[], F>>, more: NormalizerMore): Promise<void> {
    if (more.shallow)
      return
    await this.mutate(() => new Some(fetched))
  }

  async fetch(aborter = new AbortController()): Promise<Fallback<State<D[], F>>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (Time.isAfterNow(state.real?.current.cooldown))
      return new Err(state)

    return new Ok(await core.runOrJoin(cacheKey, aborter, () => Scrollable.fetchOrThrow(cacheKey, aborter, settings)))
  }

  async refetch(aborter = new AbortController()): Promise<State<D[], F>> {
    const { cacheKey, settings } = this

    return await core.runOrReplace(cacheKey, aborter, () => Scrollable.fetchOrThrow(cacheKey, aborter, settings))
  }

  async scroll(aborter = new AbortController()): Promise<State<D[], F>> {
    const { cacheKey, settings } = this

    return await core.runOrReplace(cacheKey, aborter, () => Scrollable.scrollOrThrow(cacheKey, aborter, settings))
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

  async peek(): Promise<Nullable<K>> {
    const { settings } = this
    const state = await this.state
    const pages = state.real?.data?.inner

    if (pages == null)
      return undefined

    return settings.scroller(Arrays.last(pages))
  }

  async mutate(mutator: Mutator<D[], F>): Promise<State<D[], F>> {
    return await core.mutateOrThrow(this.cacheKey, mutator, this.settings)
  }

  async delete(): Promise<State<D[], F>> {
    return await core.deleteOrThrow(this.cacheKey, this.settings)
  }

  async normalize(fetched: Nullable<Fetched<D[], F>>, more: NormalizerMore) {
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

  async scroll(aborter = new AbortController()): Promise<never> {
    throw new MissingFetcherError()
  }

}