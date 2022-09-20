import { Core } from "../core";
import { NormalizerMore } from "../index";
import { Fetcher } from "../types/fetcher";
import { Params } from "../types/params";
import { Schema } from "../types/schema";
import { Scroller } from "../types/scroller";
import { ScrollObject } from "./object";
export declare function scroll<D = any, E = any, K = any>(scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D[], E, K>): ScrollSchema<D, E, K>;
export declare class ScrollSchema<D = any, E = any, K = any> implements Schema<D[], E, K, ScrollObject<D, E, K>> {
    readonly scroller: Scroller<D, E, K>;
    readonly fetcher: Fetcher<D, E, K> | undefined;
    readonly params: Params<D[], E, K>;
    constructor(scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D[], E, K>);
    make(core: Core): ScrollObject<D, E, K>;
    normalize(data: D[], more: NormalizerMore<D[], E, K>): Promise<void>;
}
