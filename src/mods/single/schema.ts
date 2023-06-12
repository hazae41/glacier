import { Optional, Some } from "@hazae41/option";
import { Core } from "mods/core/core.js";
import { Data } from "mods/result/data.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { QueryParams } from "mods/types/params.js";
import { QuerySchema } from "mods/types/schema.js";
import { Simple } from "./helper.js";
import { SimpleQueryInstance } from "./instance.js";

export function createQuerySchema<D = unknown, K = string>(
  key: Optional<K>,
  fetcher: Optional<Fetcher<D, K>>,
  params: QueryParams<D, K> = {},
) {
  if (key === undefined)
    return undefined

  return new SimpleQuerySchema<D, K>(key, fetcher, params)
}

export class SimpleQuerySchema<D = unknown, K = unknown> implements QuerySchema<D, K, SimpleQueryInstance<D, K>>  {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly fetcher: Optional<Fetcher<D, K>>,
    readonly params: QueryParams<D, K>
  ) {
    this.cacheKey = Simple.getCacheKey<D, K>(key, params)
  }

  async make(core: Core) {
    return await SimpleQueryInstance.make<D, K>(core, this.key, this.cacheKey, this.fetcher, this.params)
  }

  async normalize(data: D, more: NormalizerMore) {
    const { core, times, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)

    await core.mutate(instance.cacheKey, () => {
      return new Some(new Data(data, times))
    }, instance.params)
  }
}