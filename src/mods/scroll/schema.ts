import { Nullable, Option, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { CooldownError, MissingFetcherError, Mutator, ScrollFetcherfulQuery, ScrollFetcherlessQuery, ScrollSkeletonQuery, State, core } from "index.js";
import { Arrays } from "libs/arrays/arrays.js";
import { CustomEventTarget } from "libs/ortho/ortho.js";
import { Time } from "libs/time/time.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { ScrollFetcherfulQuerySettings, ScrollFetcherlessQuerySettings, ScrollQuerySettings } from "mods/types/settings.js";
import { Scroll } from "./helper.js";

export function createScrollSchema<K, D, F>(
  settings: ScrollFetcherfulQuerySettings<K, D, F>,
): ScrollFetcherfulSchema<K, D, F>

export function createScrollSchema<K, D, F>(
  settings: ScrollFetcherlessQuerySettings<K, D, F>,
): ScrollFetcherlessSchema<K, D, F>

export function createScrollSchema<K, D, F>(
  settings: ScrollQuerySettings<K, D, F>,
): ScrollSchema<K, D, F>

export function createScrollSchema<K, D, F>(
  settings: ScrollQuerySettings<K, D, F>,
) {
  if (settings.fetcher == null)
    return new ScrollFetcherlessSchema<K, D, F>(settings)
  return new ScrollFetcherfulSchema<K, D, F>(settings)
}

export type ScrollSchema<K, D, F> =
  | ScrollFetcherfulSchema<K, D, F>
  | ScrollFetcherlessSchema<K, D, F>

export namespace ScrollSchema {
  export type Infer<T> =
    | undefined
    | ScrollFetcherlessSchema.Infer<T>
    | ScrollFetcherfulSchema.Infer<T>

  export type Queried<T> =
    | ScrollSkeletonSchema.Queried<T>
    | ScrollFetcherlessSchema.Queried<T>
    | ScrollFetcherfulSchema.Queried<T>
}

export namespace ScrollSkeletonSchema {
  export type Queried<T> = T extends undefined ? ScrollSkeletonQuery<any, any, any> : never
}

export namespace ScrollFetcherlessSchema {
  export type Infer<T> = ScrollFetcherlessSchema<K<T>, D<T>, F<T>>

  export type Queried<T> = T extends ScrollFetcherlessSchema<infer K, infer D, infer F> ? ScrollFetcherlessQuery<K, D, F> : never

  export type K<T> = T extends ScrollFetcherlessSchema<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends ScrollFetcherlessSchema<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends ScrollFetcherlessSchema<infer _K, infer _D, infer F> ? F : never
}

export namespace ScrollFetcherfulSchema {
  export type Infer<T> = ScrollFetcherfulSchema<K<T>, D<T>, F<T>>

  export type Queried<T> = T extends ScrollFetcherfulSchema<infer K, infer D, infer F> ? ScrollFetcherfulQuery<K, D, F> : never

  export type K<T> = T extends ScrollFetcherfulSchema<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends ScrollFetcherfulSchema<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends ScrollFetcherfulSchema<infer _K, infer _D, infer F> ? F : never
}

export class ScrollFetcherfulSchema<K, D, F> {
  readonly cacheKey: string

  readonly events = new CustomEventTarget<{
    state: State<D, F>
  }>()

  readonly dispose: () => void

  constructor(
    readonly settings: ScrollFetcherfulQuerySettings<K, D, F>
  ) {
    this.cacheKey = Scroll.getCacheKey(settings.key, settings)

    const onState = (event: CustomEvent<State<any, any>>) => {
      const { detail } = event
      const subevent = new CustomEvent("state", { detail })
      return this.events.dispatchEvent(subevent)
    }

    core.onState.addEventListener(this.cacheKey, onState, { passive: true })

    this.dispose = () => {
      core.onState.removeListener(this.cacheKey, onState)
    }
  }

  [Symbol.dispose]() {
    this.dispose()
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

export class ScrollFetcherlessSchema<K, D, F> {
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