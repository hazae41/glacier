import { Optional, Some } from "@hazae41/option";
import { Core } from "mods/core/core.js";
import { Data } from "mods/result/data.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { QuerySchema } from "mods/types/schema.js";
import { Scroller } from "mods/types/scroller.js";
import { QuerySettings } from "mods/types/settings.js";
import { Scroll } from "./helper.js";
import { ScrollQueryInstance } from "./instance.js";

export function createScrollQuerySchema<K, D, F>(
  scroller: Scroller<K, D, F>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: QuerySettings<K, D[], F> = {},
) {
  const key = scroller()

  if (key === undefined)
    return undefined

  return new ScrollQuerySchema<K, D, F>(key, scroller, fetcher, settings)
}

export class ScrollQuerySchema<K, D, F> implements QuerySchema<K, D, F, ScrollQueryInstance<K, D, F>> {
  readonly cacheKey: string

  constructor(
    readonly key: K,
    readonly scroller: Scroller<K, D, F>,
    readonly fetcher: Optional<Fetcher<K, D, F>>,
    readonly settings: QuerySettings<K, D[], F>
  ) {
    this.cacheKey = Scroll.getCacheKey(key, settings)
  }

  async make(core: Core) {
    return await ScrollQueryInstance.make(core, this.key, this.cacheKey, this.scroller, this.fetcher, this.settings)
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