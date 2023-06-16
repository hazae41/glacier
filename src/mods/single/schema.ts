import { NonOptional, Optional, Some } from "@hazae41/option";
import { Core } from "mods/core/core.js";
import { Data } from "mods/result/data.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { QuerySettings } from "mods/types/settings.js";
import { Simple } from "./helper.js";
import { SimpleFetcherfulQueryInstance, SimpleFetcherlessQueryInstance } from "./instance.js";

export function createQuerySchema<K extends undefined, D, F>(
  key: undefined,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings?: Optional<QuerySettings<K, D, F>>
): undefined

export function createQuerySchema<K, D, F>(
  key: NonOptional<K>,
  fetcher: undefined,
  settings?: Optional<QuerySettings<K, D, F>>
): SimpleFetcherlessQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  key: NonOptional<K>,
  fetcher: Fetcher<K, D, F>,
  settings?: Optional<QuerySettings<K, D, F>>
): SimpleFetcherfulQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  key: Optional<K>,
  fetcher: undefined,
  settings?: Optional<QuerySettings<K, D, F>>,
): Optional<SimpleFetcherlessQuerySchema<K, D, F>>

export function createQuerySchema<K, D, F>(
  key: Optional<K>,
  fetcher: Fetcher<K, D, F>,
  settings?: Optional<QuerySettings<K, D, F>>,
): Optional<SimpleFetcherfulQuerySchema<K, D, F>>

export function createQuerySchema<K, D, F>(
  key: Optional<K>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings?: Optional<QuerySettings<K, D, F>>,
): Optional<SimpleQuerySchema<K, D, F>>

export function createQuerySchema<K, D, F>(
  key: Optional<K>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: QuerySettings<K, D, F> = {},
) {
  if (key === undefined)
    return undefined
  if (fetcher === undefined)
    return new SimpleFetcherlessQuerySchema<K, D, F>(key, fetcher, settings)
  return new SimpleFetcherfulQuerySchema<K, D, F>(key, fetcher, settings)
}

export type SimpleQuerySchema<K, D, F> =
  | SimpleFetcherlessQuerySchema<K, D, F>
  | SimpleFetcherfulQuerySchema<K, D, F>

export class SimpleFetcherlessQuerySchema<K, D, F>  {
  readonly cacheKey: Promise<string>

  constructor(
    readonly key: K,
    readonly fetcher: undefined,
    readonly settings: QuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await SimpleFetcherlessQueryInstance.make(core, this.key, await this.cacheKey, this.fetcher, this.settings)
  }

  async normalize(data: D, more: NormalizerMore) {
    const { core, times, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)

    await core.mutate(instance.cacheKey, () => {
      return new Some(new Data(data, times))
    }, instance.settings)
  }

}

export class SimpleFetcherfulQuerySchema<K, D, F> {
  readonly cacheKey: Promise<string>

  constructor(
    readonly key: K,
    readonly fetcher: Fetcher<K, D, F>,
    readonly settings: QuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await SimpleFetcherfulQueryInstance.make(core, this.key, await this.cacheKey, this.fetcher, this.settings)
  }

  async normalize(data: D, more: NormalizerMore) {
    const { core, times, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)

    await core.mutate(instance.cacheKey, () => {
      return new Some(new Data(data, times))
    }, instance.settings)
  }

}