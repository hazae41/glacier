import { Core } from "../core";
import { Fetcher } from "../types/fetcher";
import { Params } from "../types/params";
import { Schema } from "../types/schema";
import { Scroller } from "../types/scroller";
import { ScrollObject } from "./object";
export declare function scroll<D = any, E = any, N = D, K = any>(scroller: Scroller<D, E, N, K>, fetcher: Fetcher<D, E, N, K>, params?: Params<D[], E, N[], K>): ScrollSchema<D, E, N, K>;
export declare class ScrollSchema<D = any, E = any, N = D, K = any> implements Schema<D[], E, N[], K> {
    readonly scroller: Scroller<D, E, N, K>;
    readonly fetcher: Fetcher<D, E, N, K>;
    readonly params: Params<D[], E, N[], K>;
    constructor(scroller: Scroller<D, E, N, K>, fetcher: Fetcher<D, E, N, K>, params?: Params<D[], E, N[], K>);
    make(core: Core, pparams?: Params, initialize?: boolean): ScrollObject<D, any, N, K>;
}
