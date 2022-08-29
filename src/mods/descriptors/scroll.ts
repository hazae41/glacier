import { Core } from "mods/core";
import { ScrollInstance } from "mods/instances";
import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Scroller } from "../types/scroller";

export function getScroll<D = any, E = any, K = any>(
  scroller: Scroller<D, K>,
  fetcher: Fetcher<D, K>,
  params: Params<D[], E, K> = {},
) {
  return new ScrollDescriptor(scroller, fetcher, params)
}


export class ScrollDescriptor<D = any, E = any, K = any> {
  constructor(
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Fetcher<D, K>,
    readonly params: Params<D[], E, K> = {},
  ) { }

  create(core: Core, pparams: Params = {}) {
    const { scroller, fetcher, params } = this

    return new ScrollInstance<D, E, K>(core, scroller, fetcher, params, pparams)
  }
}