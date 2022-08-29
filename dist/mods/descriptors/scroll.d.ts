import { Fetcher } from "../types/fetcher";
import { Params } from "../types/params";
import { Scroller } from "../types/scroller";
export declare class ScrollDescriptor<D = any, E = any, K = any> {
    readonly scroller: Scroller<D, K>;
    readonly fetcher: Fetcher<D, K>;
    readonly current: Params<D[], E, K>;
    constructor(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, current?: Params<D[], E, K>);
}
