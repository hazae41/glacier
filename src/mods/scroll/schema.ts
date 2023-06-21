import { Optional, Some } from "@hazae41/option";
import { Core } from "mods/core/core.js";
import { Data } from "mods/result/data.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { Scroller } from "mods/types/scroller.js";
import { QuerySettings } from "mods/types/settings.js";
import { Scroll } from "./helper.js";
import { ScrollFetcherfulQueryInstance, ScrollFetcherlessQueryInstance } from "./instance.js";

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  fetcher: Fetcher<K, D, F>,
  settings?: Optional<QuerySettings<K, D[], F>>,
): ScrollFetcherfulQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  fetcher: undefined,
  settings?: Optional<QuerySettings<K, D[], F>>,
): ScrollFetcherlessQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings?: Optional<QuerySettings<K, D[], F>>,
): ScrollQuerySchema<K, D, F>

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: QuerySettings<K, D[], F> = {},
) {
  const key = scroller()

  if (key === undefined)
    return undefined
  if (fetcher === undefined)
    return new ScrollFetcherlessQuerySchema<K, D, F>(key, scroller, fetcher, settings)
  return new ScrollFetcherfulQuerySchema<K, D, F>(key, scroller, fetcher, settings)
}

export type ScrollQuerySchema<K, D, F> =
  | ScrollFetcherfulQuerySchema<K, D, F>
  | ScrollFetcherlessQuerySchema<K, D, F>

export class ScrollFetcherfulQuerySchema<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly scroller: Scroller<K, D, F>,
    readonly fetcher: Fetcher<K, D, F>,
    readonly settings: QuerySettings<K, D[], F>
  ) {
    this.cacheKey = Scroll.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await ScrollFetcherfulQueryInstance.make(core, this.key, this.cacheKey, this.scroller, this.fetcher, this.settings)
  }

  async normalize(data: D[], more: NormalizerMore) {
    const { core, times, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)

    await core.mutate(instance.cacheKey, () => {
      return new Some(new Data(data, times))
    }, instance.settings)
  }

}

export class ScrollFetcherlessQuerySchema<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly scroller: Scroller<K, D, F>,
    readonly fetcher: undefined,
    readonly settings: QuerySettings<K, D[], F>
  ) {
    this.cacheKey = Scroll.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await ScrollFetcherlessQueryInstance.make(core, this.key, this.cacheKey, this.scroller, this.fetcher, this.settings)
  }

  async normalize(data: D[], more: NormalizerMore) {
    const { core, times, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)

    await core.mutate(instance.cacheKey, () => {
      return new Some(new Data(data, times))
    }, instance.settings)
  }

}