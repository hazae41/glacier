import { Optional, Some } from "@hazae41/option";
import { Core } from "mods/core/core.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { Scroller } from "mods/types/scroller.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings, QuerySettings } from "mods/types/settings.js";
import { Scroll } from "./helper.js";
import { ScrollFetcherfulQueryInstance, ScrollFetcherlessQueryInstance } from "./instance.js";

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  settings: FetcherfulQuerySettings<K, D[], F>,
): ScrollFetcherfulQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  settings: FetcherlessQuerySettings<K, D[], F>,
): ScrollFetcherlessQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  settings: QuerySettings<K, D[], F>,
): ScrollQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  settings: QuerySettings<K, D[], F>,
) {
  const key = scroller()

  if (key === undefined)
    return undefined

  if (settings.fetcher === undefined)
    return new ScrollFetcherlessQuerySchema<K, D, F>(key, scroller, settings)
  return new ScrollFetcherfulQuerySchema<K, D, F>(key, scroller, settings)
}

export type ScrollQuerySchema<K, D, F> =
  | ScrollFetcherfulQuerySchema<K, D, F>
  | ScrollFetcherlessQuerySchema<K, D, F>

export class ScrollFetcherfulQuerySchema<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly scroller: Scroller<K, D, F>,
    readonly settings: FetcherfulQuerySettings<K, D[], F>
  ) {
    this.cacheKey = Scroll.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await ScrollFetcherfulQueryInstance.make(core, this.key, this.cacheKey, this.scroller, this.settings)
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
    readonly key: K,
    readonly scroller: Scroller<K, D, F>,
    readonly settings: FetcherlessQuerySettings<K, D[], F>
  ) {
    this.cacheKey = Scroll.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await ScrollFetcherlessQueryInstance.make(core, this.key, this.cacheKey, this.scroller, this.settings)
  }

  async normalize(fetched: Optional<Fetched<D[], F>>, more: NormalizerMore) {
    const { core, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)
    await instance.mutate(() => new Some(fetched))
  }

}