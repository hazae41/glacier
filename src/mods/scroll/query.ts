import { Nullable, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { CooldownError, MissingFetcherError, Mutator, ScrollableFetcherfulReactQuery, ScrollableFetcherlessReactQuery, ScrollableSkeletonReactQuery, State, core } from "index.js";
import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { ScrollableFetcherfulQuerySettings, ScrollableFetcherlessQuerySettings, ScrollableQuerySettings } from "mods/types/settings.js";
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

  onState(callback: (state: CustomEvent<State<D, F>>) => void) {
    core.onState.addEventListener(this.cacheKey, callback, { passive: true })
    return () => core.onState.removeListener(this.cacheKey, callback)
  }

  get state() {
    return core.tryGet(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async tryPeek(): Promise<Result<Nullable<K>, Error>> {
    return await Result.unthrow(async t => {
      const { settings } = this
      const state = await this.state.then(r => r.throw(t))
      const pages = state.real?.data?.inner

      if (pages == null)
        return new Ok(undefined)

      return new Ok(settings.scroller(Arrays.last(pages)))
    })
  }

  async tryMutate(mutator: Mutator<D[], F>) {
    return await core.tryMutate(this.cacheKey, mutator, this.settings)
  }

  async tryDelete() {
    return await core.tryDelete(this.cacheKey, this.settings)
  }

  async tryNormalize(fetched: Nullable<Fetched<D[], F>>, more: NormalizerMore) {
    if (more.shallow)
      return
    await this.tryMutate(() => new Some(fetched))
  }

  async tryFetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, Error>, Error>> {
    return await Result.unthrow(async t => {
      const { cacheKey, settings } = this
      const state = await this.state.then(r => r.throw(t))

      if (Time.isAfterNow(state.real?.current.cooldown))
        return new Err(new CooldownError())

      const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
        await Scrollable.tryFetch(cacheKey, aborter, settings))

      return new Ok(result)
    })
  }

  async tryRefetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, Error>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scrollable.tryFetch(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async tryScroll(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, Error>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scrollable.tryScroll(cacheKey, aborter, settings))

    return new Ok(result)
  }

}

export class ScrollableFetcherlessQuery<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: ScrollableFetcherlessQuerySettings<K, D, F>
  ) {
    this.cacheKey = Scrollable.getCacheKey(settings.key)
  }

  onState(callback: (state: CustomEvent<State<D, F>>) => void) {
    core.onState.addEventListener(this.cacheKey, callback, { passive: true })
    return () => core.onState.removeListener(this.cacheKey, callback)
  }

  get state() {
    return core.tryGet(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async tryPeek(): Promise<Result<Nullable<K>, Error>> {
    return await Result.unthrow(async t => {
      const { settings } = this
      const state = await this.state.then(r => r.throw(t))
      const pages = state.real?.data?.inner

      if (pages == null)
        return new Ok(undefined)

      return new Ok(settings.scroller(Arrays.last(pages)))
    })
  }

  async tryMutate(mutator: Mutator<D[], F>) {
    return await core.tryMutate(this.cacheKey, mutator, this.settings)
  }

  async tryDelete() {
    return await core.tryDelete(this.cacheKey, this.settings)
  }

  async tryNormalize(fetched: Nullable<Fetched<D[], F>>, more: NormalizerMore) {
    if (more.shallow)
      return
    await this.tryMutate(() => new Some(fetched))
  }

  async tryFetch(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

  async tryRefetch(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

  async tryScroll(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

}