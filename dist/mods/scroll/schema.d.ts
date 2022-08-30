import { Core } from "../core";
import { Fetcher } from "../types/fetcher";
import { Params } from "../types/params";
import { Schema } from "../types/schema";
import { Scroller } from "../types/scroller";
import { ScrollObject } from "./object";
export declare function scroll<D = any, E = any, K = any>(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, params?: Params<D[], E, K>): ScrollSchema<D, E, K>;
export declare class ScrollSchema<D = any, E = any, K = any> extends Schema<D, E, K> {
    readonly scroller: Scroller<D, K>;
    readonly fetcher: Fetcher<D, K>;
    readonly params: Params<D[], E, K>;
    constructor(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, params?: Params<D[], E, K>);
    make(core: Core, pparams?: Params): ScrollObject<D, E, K>;
}
