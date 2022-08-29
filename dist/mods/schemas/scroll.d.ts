import { Core } from "../core";
import { ScrollObject } from "../objects/index";
import { Fetcher } from "../types/fetcher";
import { Params } from "../types/params";
import { Scroller } from "../types/scroller";
import { Schema } from "./schema";
export declare function scroll<D = any, E = any, K = any>(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, params?: Params<D[], E, K>): ScrollSchema<D, E, K>;
export declare class ScrollSchema<D = any, E = any, K = any> extends Schema<D, E, K> {
    readonly scroller: Scroller<D, K>;
    readonly fetcher: Fetcher<D, K>;
    readonly params: Params<D[], E, K>;
    constructor(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, params?: Params<D[], E, K>);
    make(core: Core, pparams?: Params): ScrollObject<D, E, K>;
}
