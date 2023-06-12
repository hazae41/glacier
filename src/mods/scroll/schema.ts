import { Optional, Some } from "@hazae41/option";
import { Core } from "mods/core/core.js";
import { Data } from "mods/result/data.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { QueryParams } from "mods/types/params.js";
import { QuerySchema } from "mods/types/schema.js";
import { Scroller } from "mods/types/scroller.js";
import { Scroll } from "./helper.js";
import { ScrollInstance } from "./instance.js";

export function createScrollQuerySchema<D = unknown, K = string>(
  scroller: Scroller<D, K>,
  fetcher: Optional<Fetcher<D, K>>,
  params: QueryParams<D[], K> = {},
) {
  const key = scroller()

  if (key === undefined)
    return undefined

  return new ScrollQuerySchema<D, K>(key, scroller, fetcher, params)
}

export class ScrollQuerySchema<D = unknown, K = unknown> implements QuerySchema<D[], K, ScrollInstance<D, K>> {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Optional<Fetcher<D, K>>,
    readonly params: QueryParams<D[], K>
  ) {
    this.cacheKey = Scroll.getCacheKey<D[], K>(key, params)
  }

  async make(core: Core) {
    return await ScrollInstance.make<D, K>(core, this.key, this.cacheKey, this.scroller, this.fetcher, this.params)
  }

  async normalize(data: D[], more: NormalizerMore) {
    const { core, times, shallow } = more

    if (shallow)
      return

    const instance = await this.make(core)

    await core.mutate(instance.cacheKey, () => {
      return new Some(new Data(data, times))
    }, instance.params)
  }

}