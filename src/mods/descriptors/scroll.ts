import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Scroller } from "../types/scroller";

export class ScrollDescriptor<D = any, E = any, K = any> {
  constructor(
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Fetcher<D, K>,
    readonly current: Params<D[], E, K> = {},
  ) { }
}