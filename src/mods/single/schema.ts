import { NonOptional, Optional, Some } from "@hazae41/option";
import { Core } from "mods/core/core.js";
import { Data } from "mods/result/data.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { QuerySchema } from "mods/types/schema.js";
import { QuerySettings } from "mods/types/settings.js";
import { Simple } from "./helper.js";
import { SimpleQueryInstance } from "./instance.js";

export function createQuerySchema<K extends undefined, D, F>(
  key: undefined,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: Optional<QuerySettings<K, D, F>>
): undefined

export function createQuerySchema<K, D, F>(
  key: NonOptional<K>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: Optional<QuerySettings<K, D, F>>
): SimpleQuerySchema<K, D, F>

export function createQuerySchema<K, D, F>(
  key: Optional<K>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: Optional<QuerySettings<K, D, F>>,
): Optional<SimpleQuerySchema<K, D, F>>

export function createQuerySchema<K, D, F>(
  key: Optional<K>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: QuerySettings<K, D, F> = {},
) {
  if (key === undefined)
    return undefined
  return new SimpleQuerySchema<K, D, F>(key, fetcher, settings)
}

export class SimpleQuerySchema<K, D, F> implements QuerySchema<K, D, F, SimpleQueryInstance<K, D, F>>  {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly fetcher: Optional<Fetcher<K, D, F>>,
    readonly settings: QuerySettings<K, D, F>
  ) {
    this.cacheKey = Simple.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await SimpleQueryInstance.make(core, this.key, this.cacheKey, this.fetcher, this.settings)
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