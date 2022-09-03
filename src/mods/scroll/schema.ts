import { Core } from "mods/core";
import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Schema } from "mods/types/schema";
import { Scroller } from "mods/types/scroller";
import { ScrollObject } from "./object";

export function scroll<D = any, E = any, K = any>(
  scroller: Scroller<D, K>,
  fetcher: Fetcher<D, E, K>,
  params: Params<D[], E, K> = {},
) {
  return new ScrollSchema(scroller, fetcher, params)
}

export class ScrollSchema<D = any, E = any, K = any> extends Schema<D, E, K> {
  constructor(
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Fetcher<D, E, K>,
    readonly params: Params<D[], E, K> = {},
  ) { super() }

  make(core: Core, pparams: Params = {}) {
    const { scroller, fetcher, params } = this

    return new ScrollObject<D, E, K>(core, scroller, fetcher, params, pparams)
  }
}