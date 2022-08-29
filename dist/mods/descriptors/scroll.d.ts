import { Core } from "../core";
import { ScrollInstance } from "../instances";
import { Fetcher } from "../types/fetcher";
import { Params } from "../types/params";
import { Scroller } from "../types/scroller";
export declare function getScroll<D = any, E = any, K = any>(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, params?: Params<D[], E, K>): ScrollDescriptor<D, E, K>;
export declare class ScrollDescriptor<D = any, E = any, K = any> {
    readonly scroller: Scroller<D, K>;
    readonly fetcher: Fetcher<D, K>;
    readonly params: Params<D[], E, K>;
    constructor(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, params?: Params<D[], E, K>);
    create(core: Core, pparams?: Params): ScrollInstance<D, E, K>;
}
