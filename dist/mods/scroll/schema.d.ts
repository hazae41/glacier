import { Core } from "../core.js";
import { Fetcher } from "../types/fetcher.js";
import { NormalizerMore } from "../types/normalizer.js";
import { Params } from "../types/params.js";
import { Schema } from "../types/schema.js";
import { Scroller } from "../types/scroller.js";
import { ScrollObject } from "./object.js";
export declare function scroll<D = any, E = any, K = any>(scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D[], E, K>): ScrollSchema<D, E, K>;
export declare class ScrollSchema<D = any, E = any, K = any> implements Schema<D[], E, K, ScrollObject<D, E, K>> {
    readonly scroller: Scroller<D, E, K>;
    readonly fetcher: Fetcher<D, E, K> | undefined;
    readonly params: Params<D[], E, K>;
    constructor(scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D[], E, K>);
    make(core: Core): ScrollObject<D, E, K>;
    normalize(data: D[], more: NormalizerMore<D[], E, K>): Promise<void>;
}
