import { Core } from "../core.js";
import { Fetcher } from "../types/fetcher.js";
import { NormalizerMore } from "../types/normalizer.js";
import { Params } from "../types/params.js";
import { Schema } from "../types/schema.js";
import { SingleObject } from "./object.js";
export declare function single<D = any, E = any, K = any>(key: K | undefined, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D, E, K>): SingleSchema<D, E, K>;
export declare class SingleSchema<D = any, E = any, K = any> implements Schema<D, E, K, SingleObject<D, E, K>> {
    readonly key: K | undefined;
    readonly fetcher: Fetcher<D, E, K> | undefined;
    readonly params: Params<D, E, K>;
    constructor(key: K | undefined, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D, E, K>);
    make(core: Core): SingleObject<D, E, K>;
    normalize(data: D, more: NormalizerMore<D, E, K>): Promise<void>;
}
