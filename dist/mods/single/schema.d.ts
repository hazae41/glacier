import { Core } from "../core";
import { Params } from "../types/params";
import { Poster } from "../types/poster";
import { Schema } from "../types/schema";
import { SingleObject } from "./object";
export declare function single<D = any, E = any, N = D, K = any>(key: K | undefined, poster: Poster<D, E, N, K> | undefined, params?: Params<D, E, N, K>): SingleSchema<D, E, N, K>;
export declare class SingleSchema<D = any, E = any, N = D, K = any> implements Schema<D, E, N, K, SingleObject<D, E, N, K>> {
    readonly key: K | undefined;
    readonly poster: Poster<D, E, N, K> | undefined;
    readonly params: Params<D, E, N, K>;
    constructor(key: K | undefined, poster: Poster<D, E, N, K> | undefined, params?: Params<D, E, N, K>);
    make(core: Core, pparams?: Params): SingleObject<D, any, any, K>;
}
