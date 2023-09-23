import { Optional, Some } from "@hazae41/option";
import { SimpleFetcherfulQuery, SimpleFetcherlessQuery, SimpleSkeletonQuery } from "index.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings, KeyedQuerySettings } from "mods/types/settings.js";
import { Simple } from "./helper.js";
import { SimpleFetcherfulQueryInstance, SimpleFetcherlessQueryInstance } from "./instance.js";

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

  async make() {
    return await SimpleFetcherlessQueryInstance.make(this.cacheKey, this.settings)
  }

  async normalize(fetched: Optional<Fetched<D, F>>, more: NormalizerMore) {
    const { shallow } = more

    if (shallow)
      return

    const instance = await this.make()
    await instance.mutate(() => new Some(fetched))
  }

}

export class SimpleFetcherfulQuerySchema<K, D, F> {
  // declare __query: SimpleFetcherfulQuery<K, D, F>

  readonly cacheKey: string

  constructor(
    readonly settings: FetcherfulQuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(settings.key, settings)
  }

  async make() {
    return await SimpleFetcherfulQueryInstance.make(this.cacheKey, this.settings)
  }

  async normalize(fetched: Optional<Fetched<D, F>>, more: NormalizerMore) {
    const { shallow } = more

    if (shallow)
      return

    const instance = await this.make()
    await instance.mutate(() => new Some(fetched))
  }

}