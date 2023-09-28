import { Nullable, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { CooldownError, MissingFetcherError, Mutator, SimpleFetcherfulQuery, SimpleFetcherlessQuery, SimpleSkeletonQuery, State, Updater, core } from "index.js";
import { CustomEventTarget } from "libs/ortho/ortho.js";
import { Time } from "libs/time/time.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings, KeyedQuerySettings } from "mods/types/settings.js";
import { Simple } from "./helper.js";

export function createSchema<K, D, F>(
  settings: FetcherlessQuerySettings<K, D, F>
): SimpleFetcherlessSchema<K, D, F>

export function createSchema<K, D, F>(
  settings: FetcherfulQuerySettings<K, D, F>
): SimpleFetcherfulSchema<K, D, F>

export function createSchema<K, D, F>(
  settings: KeyedQuerySettings<K, D, F>,
): SimpleSchema<K, D, F>

export function createSchema<K, D, F>(
  settings: KeyedQuerySettings<K, D, F>,
) {
  if (settings.fetcher == null)
    return new SimpleFetcherlessSchema<K, D, F>(settings)
  else
    return new SimpleFetcherfulSchema<K, D, F>(settings)
}

export type SimpleSchema<K, D, F> =
  | SimpleFetcherlessSchema<K, D, F>
  | SimpleFetcherfulSchema<K, D, F>

export namespace SimpleSchema {
  export type Infer<T> =
    | undefined
    | SimpleFetcherlessSchema.Infer<T>
    | SimpleFetcherfulSchema.Infer<T>

  export type Queried<T> =
    | SimpleSkeletonSchema.Queried<T>
    | SimpleFetcherlessSchema.Queried<T>
    | SimpleFetcherfulSchema.Queried<T>
}

export namespace SimpleSkeletonSchema {
  export type Queried<T> = T extends undefined ? SimpleSkeletonQuery<any, any, any> : never
}

export namespace SimpleFetcherlessSchema {
  export type Infer<T> = SimpleFetcherlessSchema<K<T>, D<T>, F<T>>

  export type Queried<T> = T extends SimpleFetcherlessSchema<infer K, infer D, infer F> ? SimpleFetcherlessQuery<K, D, F> : never

  export type K<T> = T extends SimpleFetcherlessSchema<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends SimpleFetcherlessSchema<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends SimpleFetcherlessSchema<infer _K, infer _D, infer F> ? F : never
}

export namespace SimpleFetcherfulSchema {
  export type Infer<T> = SimpleFetcherfulSchema<K<T>, D<T>, F<T>>

  export type Queried<T> = T extends SimpleFetcherfulSchema<infer K, infer D, infer F> ? SimpleFetcherfulQuery<K, D, F> : never

  export type K<T> = T extends SimpleFetcherfulSchema<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends SimpleFetcherfulSchema<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends SimpleFetcherfulSchema<infer _K, infer _D, infer F> ? F : never
}

export class SimpleFetcherlessSchema<K, D, F> {
  readonly cacheKey: string

  readonly events = new CustomEventTarget<{
    state: State<D, F>
  }>()

  readonly dispose: () => void

  constructor(
    readonly settings: FetcherlessQuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(settings.key, settings)

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

  async normalize(fetched: Nullable<Fetched<D, F>>, more: NormalizerMore) {
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

  async mutate(mutator: Mutator<D, F>) {
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

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

}

export class SimpleFetcherfulSchema<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: FetcherfulQuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(settings.key, settings)
  }

  async normalize(fetched: Nullable<Fetched<D, F>>, more: NormalizerMore) {
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

  async mutate(mutator: Mutator<D, F>) {
    return await core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await core.delete(this.cacheKey, this.settings)
  }

  async fetch(aborter = new AbortController()): Promise<Result<Result<State<D, F>, Error>, CooldownError>> {
    const { cacheKey, settings } = this
    const state = await this.state

    if (Time.isAfterNow(state.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async refetch(aborter = new AbortController()): Promise<Result<Result<State<D, F>, Error>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Simple.fetch(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<Result<State<D, F>, Error>, never>> {
    const { cacheKey, settings } = this

    const result = await Simple.update(cacheKey, updater, aborter, settings)

    return new Ok(result)
  }

}