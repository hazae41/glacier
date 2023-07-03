import { Optional, Some } from "@hazae41/option";
import { Core } from "mods/core/core.js";
import { Fetched } from "mods/result/fetched.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings, QuerySettings } from "mods/types/settings.js";
import { Simple } from "./helper.js";
import { SimpleFetcherfulQueryInstance, SimpleFetcherlessQueryInstance } from "./instance.js";

export function createQuerySchema<K, D, F>(
  key: K,
  settings: FetcherlessQuerySettings<K, D, F>
): SimpleFetcherlessQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  key: K,
  settings: FetcherfulQuerySettings<K, D, F>
): SimpleFetcherfulQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  key: K,
  settings: QuerySettings<K, D, F>,
): SimpleQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  key: K,
  settings: QuerySettings<K, D, F>,
) {
  if (settings.fetcher === undefined)
    return new SimpleFetcherlessQuerySchema<K, D, F>(key, settings)
  return new SimpleFetcherfulQuerySchema<K, D, F>(key, settings)
}

export type SimpleQuerySchema<K, D, F> =
  | SimpleFetcherlessQuerySchema<K, D, F>
  | SimpleFetcherfulQuerySchema<K, D, F>

export class SimpleFetcherlessQuerySchema<K, D, F>  {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly settings: FetcherlessQuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await SimpleFetcherlessQueryInstance.make(core, this.key, this.cacheKey, this.settings)
  }

  async normalize(fetched: Optional<Fetched<D, F>>, more: NormalizerMore) {
    const { core, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)
    await instance.mutate(() => new Some(fetched))
  }

}

export class SimpleFetcherfulQuerySchema<K, D, F> {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly settings: FetcherfulQuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await SimpleFetcherfulQueryInstance.make(core, this.key, this.cacheKey, this.settings)
  }

  async normalize(fetched: Optional<Fetched<D, F>>, more: NormalizerMore) {
    const { core, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)
    await instance.mutate(() => new Some(fetched))
  }

}