import { Core } from "mods/core";
import { NormalizerMore } from "mods/index";
import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Schema } from "mods/types/schema";
import { Scroller } from "mods/types/scroller";
import { ScrollObject } from "./object";

export function scroll<D = any, E = any, N extends D = D, K = any>(
  scroller: Scroller<D, E, N, K>,
  fetcher: Fetcher<D, E, N, K> | undefined,
  params: Params<D[], E, N[], K> = {},
) {
  return new ScrollSchema(scroller, fetcher, params)
}

export class ScrollSchema<D = any, E = any, N extends D = D, K = any> implements Schema<D[], E, N[], K, ScrollObject<D, E, N, K>> {
  constructor(
    readonly scroller: Scroller<D, E, N, K>,
    readonly fetcher: Fetcher<D, E, N, K> | undefined,
    readonly params: Params<D[], E, N[], K> = {},
  ) { }

  make(core: Core) {
    const { scroller, fetcher, params } = this

    return new ScrollObject<D, E, N, K>(core, scroller, fetcher, params)
  }

  async normalize(data: D[], more: NormalizerMore<D[], E, N[], K>) {
    if (more.shallow) return
    const { time, cooldown, expiration, optimistic } = more.root
    const state = { data, time, cooldown, expiration, optimistic }
    await this.make(more.core).mutate(() => state)
  }
}