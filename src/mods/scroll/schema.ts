import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { QueryParams } from "mods/types/params.js";
import { Schema } from "mods/types/schema.js";
import { Scroller } from "mods/types/scroller.js";
import { ScrollInstance } from "./instance.js";

export function getScrollSchema<D = unknown, K = string>(
  scroller: Scroller<D, K>,
  fetcher: Fetcher<D, K> | undefined,
  params: QueryParams<D[], K> = {},
) {
  return new ScrollSchema<D, K>(scroller, fetcher, params)
}

export class ScrollSchema<D = unknown, K = unknown> implements Schema<D[], K, ScrollInstance<D, K>> {

  constructor(
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: QueryParams<D[], K> = {},
  ) { }

  make(core: Core) {
    const { scroller, fetcher, params } = this

    return new ScrollInstance<D, K>(core, scroller, fetcher, params)
  }

  async normalize(data: D[], more: NormalizerMore) {
    const { core, parent, shallow } = more

    if (shallow)
      return

    const { storageKey, mparams } = this.make(core)
    const { time, cooldown, expiration } = parent

    await more.core.apply(storageKey, () => ({
      data: data,
      error: undefined,
      time: time,
      cooldown: cooldown,
      expiration: expiration,
    }), mparams)
  }
}