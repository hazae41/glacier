import { Core } from "mods/core";
import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Schema } from "mods/types/schema";
import { Scroller } from "mods/types/scroller";
import { ScrollObject } from "./object";

export function scroll<D = any, E = any, N = D, K = any>(
  scroller: Scroller<D, E, N, K>,
  fetcher: Fetcher<D, E, N, K>,
  params: Params<D[], E, N[], K> = {},
) {
  return new ScrollSchema(scroller, fetcher, params)
}

export class ScrollSchema<D = any, E = any, N = D, K = any> implements Schema<D[], E, N[], K, ScrollObject<D, E, N, K>> {
  constructor(
    readonly scroller: Scroller<D, E, N, K>,
    readonly fetcher: Fetcher<D, E, N, K>,
    readonly params: Params<D[], E, N[], K> = {},
  ) { }

  make(core: Core, pparams: Params = {}, initialize?: boolean) {
    const { scroller, fetcher, params } = this

    return new ScrollObject(core, scroller, fetcher, params, pparams, initialize)
  }
}