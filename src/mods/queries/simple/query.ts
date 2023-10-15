import { Nullable, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError, core } from "mods/core/core.js";
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
    return core.tryGet(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async tryMutate(mutator: Mutator<D, F>) {
    return await core.tryMutate(this.cacheKey, mutator, this.settings)
  }

  async tryDelete() {
    return await core.tryDelete(this.cacheKey, this.settings)
  }

  async tryNormalize(fetched: Nullable<Fetched<D, F>>, more: NormalizerMore) {
    if (more.shallow)
      return
    await this.tryMutate(() => new Ok(new Some(fetched)))
  }

  async tryFetch(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

  async tryRefetch(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

  async tryUpdate(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
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
    return core.tryGet(this.cacheKey, this.settings)
  }

  get aborter(): Nullable<AbortController> {
    return core.getAborterSync(this.cacheKey)
  }

  async tryMutate(mutator: Mutator<D, F>) {
    return await core.tryMutate(this.cacheKey, mutator, this.settings)
  }

  async tryDelete() {
    return await core.tryDelete(this.cacheKey, this.settings)
  }

  async tryNormalize(fetched: Nullable<Fetched<D, F>>, more: NormalizerMore) {
    if (more.shallow)
      return
    await this.tryMutate(() => new Ok(new Some(fetched)))
  }

  async tryFetch(aborter = new AbortController()): Promise<Result<Result<State<D, F>, Error>, Error>> {
    return await Result.unthrow(async t => {
      const { cacheKey, settings } = this
      const state = await this.state.then(r => r.throw(t))

      if (Time.isAfterNow(state.real?.current.cooldown))
        return new Err(new CooldownError())

      const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
        await Simple.tryFetch(cacheKey, aborter, settings))

      return new Ok(result)
    })
  }

  async tryRefetch(aborter = new AbortController()): Promise<Result<Result<State<D, F>, Error>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Simple.tryFetch(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async tryUpdate(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<Result<State<D, F>, Error>, never>> {
    const { cacheKey, settings } = this

    const result = await Simple.tryUpdate(cacheKey, updater, aborter, settings)

    return new Ok(result)
  }

}