import { Nullable, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { CooldownError, MissingFetcherError, Mutator, SimpleFetcherfulQuery, SimpleFetcherlessQuery, SimpleSkeletonQuery, State, Updater, core } from "index.js";
import { Time } from "libs/time/time.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings, KeyedQuerySettings } from "mods/types/settings.js";
import { Simple } from "./helper.js";

export function createQuerySchema<K, D, F>(
  settings: FetcherlessQuerySettings<K, D, F>
): SimpleFetcherlessQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  settings: FetcherfulQuerySettings<K, D, F>
): SimpleFetcherfulQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  settings: KeyedQuerySettings<K, D, F>,
): SimpleQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  settings: KeyedQuerySettings<K, D, F>,
) {
  if (settings.fetcher == null)
    return new SimpleFetcherlessQuerySchema<K, D, F>(settings)

  return new SimpleFetcherfulQuerySchema<K, D, F>(settings)
}

export type SimpleQuerySchema<K, D, F> =
  | SimpleFetcherlessQuerySchema<K, D, F>
  | SimpleFetcherfulQuerySchema<K, D, F>

export namespace SimpleQuerySchema {
  export type Infer<T> =
    | undefined
    | SimpleFetcherlessQuerySchema.Infer<T>
    | SimpleFetcherfulQuerySchema.Infer<T>

  export type Queried<T> =
    | SimpleSkeletonQuerySchema.Queried<T>
    | SimpleFetcherlessQuerySchema.Queried<T>
    | SimpleFetcherfulQuerySchema.Queried<T>
}

export namespace SimpleSkeletonQuerySchema {
  export type Queried<T> = T extends undefined ? SimpleSkeletonQuery<any, any, any> : never
}

export namespace SimpleFetcherlessQuerySchema {
  export type Infer<T> = SimpleFetcherlessQuerySchema<K<T>, D<T>, F<T>>

  export type Queried<T> = T extends SimpleFetcherlessQuerySchema<infer K, infer D, infer F> ? SimpleFetcherlessQuery<K, D, F> : never

  export type K<T> = T extends SimpleFetcherlessQuerySchema<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends SimpleFetcherlessQuerySchema<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends SimpleFetcherlessQuerySchema<infer _K, infer _D, infer F> ? F : never
}

export namespace SimpleFetcherfulQuerySchema {
  export type Infer<T> = SimpleFetcherfulQuerySchema<K<T>, D<T>, F<T>>

  export type Queried<T> = T extends SimpleFetcherfulQuerySchema<infer K, infer D, infer F> ? SimpleFetcherfulQuery<K, D, F> : never

  export type K<T> = T extends SimpleFetcherfulQuerySchema<infer K, infer _D, infer _F> ? K : never
  export type D<T> = T extends SimpleFetcherfulQuerySchema<infer _K, infer D, infer _F> ? D : never
  export type F<T> = T extends SimpleFetcherfulQuerySchema<infer _K, infer _D, infer F> ? F : never
}

export class SimpleFetcherlessQuerySchema<K, D, F>  {
  readonly cacheKey: string

  constructor(
    readonly settings: FetcherlessQuerySettings<K, D, F>
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

export class SimpleFetcherfulQuerySchema<K, D, F> {
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