import { Nullable, Option, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { CooldownError, MissingFetcherError, Mutator, ScrollFetcherfulQuery, ScrollFetcherlessQuery, ScrollSkeletonQuery, State, core } from "index.js";
import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { ScrollFetcherfulQuerySettings, ScrollFetcherlessQuerySettings, ScrollQuerySettings } from "mods/types/settings.js";
import { Scroll } from "./helper.js";

export function createScrollQuerySchema<K, D, F>(
  settings: ScrollFetcherfulQuerySettings<K, D, F>,
): ScrollFetcherfulQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  settings: ScrollFetcherlessQuerySettings<K, D, F>,
): ScrollFetcherlessQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  settings: ScrollQuerySettings<K, D, F>,
): ScrollQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  settings: ScrollQuerySettings<K, D, F>,
) {
  if (settings.fetcher == null)
    return new ScrollFetcherlessQuerySchema<K, D, F>(settings)
  return new ScrollFetcherfulQuerySchema<K, D, F>(settings)
}

export type ScrollQuerySchema<K, D, F> =
  | ScrollFetcherfulQuerySchema<K, D, F>
  | ScrollFetcherlessQuerySchema<K, D, F>

export namespace ScrollQuerySchema {
  export type Infer<T> =
    | undefined
    | ScrollFetcherlessQuerySchema.Infer<T>
    | ScrollFetcherfulQuerySchema.Infer<T>

  export type Queried<T> =
    | ScrollSkeletonQuerySchema.Queried<T>
    | ScrollFetcherlessQuerySchema.Queried<T>
    | ScrollFetcherfulQuerySchema.Queried<T>
}

export namespace ScrollSkeletonQuerySchema {
  export type Queried<T> = T extends undefined ? ScrollSkeletonQuery<any, any, any> : never
}

export namespace ScrollFetcherlessQuerySchema {
  export type Infer<T> = ScrollFetcherlessQuerySchema<K<T>, D<T>, F<T>>

  export type Queried<T> = T extends ScrollFetcherlessQuerySchema<infer K, infer D, infer F> ? ScrollFetcherlessQuery<K, D, F> : never

  export type K<T> = T extends ScrollFetcherlessQuerySchema<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends ScrollFetcherlessQuerySchema<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends ScrollFetcherlessQuerySchema<infer _K, infer _D, infer F> ? F : never
}

export namespace ScrollFetcherfulQuerySchema {
  export type Infer<T> = ScrollFetcherfulQuerySchema<K<T>, D<T>, F<T>>

  export type Queried<T> = T extends ScrollFetcherfulQuerySchema<infer K, infer D, infer F> ? ScrollFetcherfulQuery<K, D, F> : never

  export type K<T> = T extends ScrollFetcherfulQuerySchema<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends ScrollFetcherfulQuerySchema<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends ScrollFetcherfulQuerySchema<infer _K, infer _D, infer F> ? F : never
}

export class ScrollFetcherfulQuerySchema<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: ScrollFetcherfulQuerySettings<K, D, F>
  ) {
    this.cacheKey = Scroll.getCacheKey(settings.key, settings)
  }

  async normalize(fetched: Nullable<Fetched<D[], F>>, more: NormalizerMore) {
    if (more.shallow)
      return
    await this.mutate(() => new Some(fetched))
  }

  get state() {
    return core.get(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async peek() {
    const { settings } = this
    const state = await this.state

    return Option.mapSync(state.real?.data?.inner, pages => settings.scroller(Arrays.last(pages)))
  }

  async mutate(mutator: Mutator<D[], F>) {
    return await core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await core.delete(this.cacheKey, this.settings)
  }

  async fetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, Error>, CooldownError>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (Time.isAfterNow(state.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scroll.first(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async refetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, Error>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.first(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async scroll(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, Error>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.scroll(cacheKey, aborter, settings))

    return new Ok(result)
  }

}

export class ScrollFetcherlessQuerySchema<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: ScrollFetcherlessQuerySettings<K, D, F>
  ) {
    this.cacheKey = Scroll.getCacheKey(settings.key, settings)
  }

  async normalize(fetched: Nullable<Fetched<D[], F>>, more: NormalizerMore) {
    if (more.shallow)
      return
    await this.mutate(() => new Some(fetched))
  }

  get state() {
    return core.get(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async peek() {
    const { settings } = this
    const state = await this.state

    return Option.mapSync(state.real?.data?.inner, pages => settings.scroller(Arrays.last(pages)))
  }

  async mutate(mutator: Mutator<D[], F>) {
    return await core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await core.delete(this.cacheKey, this.settings)
  }

  async fetch(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

  async refetch(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

  async scroll(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

}