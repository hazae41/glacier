import { Core } from "../core";
import { NormalizerMore } from "../types/normalizer";
import { Params } from "../types/params";
import { Poster } from "../types/poster";
import { Schema } from "../types/schema";
import { SingleObject } from "./object";
export declare function single<D = any, E = any, K = any>(key: K | undefined, poster: Poster<D, E, K> | undefined, params?: Params<D, E, K>): SingleSchema<D, E, K>;
export declare class SingleSchema<D = any, E = any, K = any> implements Schema<D, E, K, SingleObject<D, E, K>> {
    readonly key: K | undefined;
    readonly poster: Poster<D, E, K> | undefined;
    readonly params: Params<D, E, K>;
    constructor(key: K | undefined, poster: Poster<D, E, K> | undefined, params?: Params<D, E, K>);
    make(core: Core): SingleObject<D, E, K>;
    normalize(data: D, more: NormalizerMore<D, E, K>): Promise<void>;
}
