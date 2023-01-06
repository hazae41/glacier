import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { Params } from "mods/types/params.js";
import { Schema } from "mods/types/schema.js";
import { Scroller } from "mods/types/scroller.js";
import { ScrollInstance } from "./instance.js";

export function getScrollSchema<D, K>(
  scroller: Scroller<D, K>,
  fetcher: Fetcher<D, K> | undefined,
  params: Params<D[], K> = {},
) {
  return new ScrollSchema<D, K>(scroller, fetcher, params)
}

export class ScrollSchema<D = unknown, K = unknown> implements Schema<D[], K, ScrollInstance<D, K>> {
  constructor(
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: Params<D[], K> = {},
  ) { }

  make(core: Core) {
    const { scroller, fetcher, params } = this

    return new ScrollInstance<D, K>(core, scroller, fetcher, params)
  }

  async normalize(data: D[], more: NormalizerMore<D[]>) {
    if (more.shallow) return
    const { time, cooldown, expiration, optimistic } = more.root
    const state = { data, time, cooldown, expiration, optimistic }
    await this.make(more.core).mutate(() => state)
  }
}