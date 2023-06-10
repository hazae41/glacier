import { Optional } from "@hazae41/option";
import { Data } from "index.js";
import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { QueryParams } from "mods/types/params.js";
import { QuerySchema } from "mods/types/schema.js";
import { SingleQueryInstance } from "./instance.js";

export function createQuerySchema<D = unknown, K = string>(
  key: Optional<K>,
  fetcher: Optional<Fetcher<D, K>>,
  params: QueryParams<D, K> = {},
) {
  if (key === undefined)
    return undefined

  return new SingleQuerySchema<D, K>(key, fetcher, params)
}

export class SingleQuerySchema<D = unknown, K = unknown> implements QuerySchema<D, K, SingleQueryInstance<D, K>>  {

  constructor(
    readonly key: K,
    readonly fetcher: Optional<Fetcher<D, K>>,
    readonly params: QueryParams<D, K>
  ) { }

  async make(core: Core) {
    return await SingleQueryInstance.make<D, K>(core, this.key, this.fetcher, this.params)
  }

  async normalize(data: D, more: NormalizerMore) {
    const { core, parent, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)

    await core.mutate(instance.cacheKey, () => {
      return new Data(data, parent)
    }, instance.params)
  }
}