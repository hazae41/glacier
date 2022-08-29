import { Core } from "../core";
import { SingleObject } from "../objects/single";
import { Poster } from "../types/poster";
import { Params } from "../types/params";
import { Schema } from "./schema";
export declare function single<D = any, E = any, K = any>(key: K | undefined, poster: Poster<D, K>, params?: Params<D, E, K>): SingleSchema<D, E, K>;
export declare class SingleSchema<D = any, E = any, K = any> extends Schema<D, E, K> {
    readonly key: K | undefined;
    readonly poster: Poster<D, K>;
    readonly params: Params<D, E, K>;
    constructor(key: K | undefined, poster: Poster<D, K>, params?: Params<D, E, K>);
    make(core: Core, pparams?: Params): SingleObject<D, E, K>;
}
