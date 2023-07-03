import { Optional, Some } from "@hazae41/option";
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
  if (settings.fetcher === undefined)
    return new ScrollFetcherlessQuerySchema<K, D, F>(settings)
  return new ScrollFetcherfulQuerySchema<K, D, F>(settings)
}

export type ScrollQuerySchema<K, D, F> =
  | ScrollFetcherfulQuerySchema<K, D, F>
  | ScrollFetcherlessQuerySchema<K, D, F>

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