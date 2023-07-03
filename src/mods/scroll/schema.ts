import { Optional, Some } from "@hazae41/option";
import { ScrollFetcherfulQuery, ScrollFetcherlessQuery, ScrollSkeletonQuery } from "index.js";
import { Core } from "mods/core/core.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { ScrollFetcherfulQuerySettings, ScrollFetcherlessQuerySettings, ScrollQuerySettings } from "mods/types/settings.js";
import { Scroll } from "./helper.js";
import { ScrollFetcherfulQueryInstance, ScrollFetcherlessQueryInstance } from "./instance.js";

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

  async make(core: Core) {
    return await ScrollFetcherfulQueryInstance.make(core, this.cacheKey, this.settings)
  }

  async normalize(fetched: Optional<Fetched<D[], F>>, more: NormalizerMore) {
    const { core, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)
    await instance.mutate(() => new Some(fetched))
  }

}

export class ScrollFetcherlessQuerySchema<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly settings: ScrollFetcherlessQuerySettings<K, D, F>
  ) {
    this.cacheKey = Scroll.getCacheKey(settings.key, settings)
  }

  async make(core: Core) {
    return await ScrollFetcherlessQueryInstance.make(core, this.cacheKey, this.settings)
  }

  async normalize(fetched: Optional<Fetched<D[], F>>, more: NormalizerMore) {
    const { core, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)
    await instance.mutate(() => new Some(fetched))
  }

}