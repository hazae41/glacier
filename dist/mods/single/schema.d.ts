import { Core } from "../core";
import { Params } from "../types/params";
import { Poster } from "../types/poster";
import { Schema } from "../types/schema";
import { SingleObject } from "./object";
export declare function single<D = any, E = any, K = any>(key: K | undefined, poster: Poster<D, K>, params?: Params<D, E, K>): SingleSchema<D, E, K>;
export declare class SingleSchema<D = any, E = any, K = any> extends Schema<D, E, K> {
    readonly key: K | undefined;
    readonly poster: Poster<D, K>;
    readonly params: Params<D, E, K>;
    constructor(key: K | undefined, poster: Poster<D, K>, params?: Params<D, E, K>);
    make(core: Core, pparams?: Params): SingleObject<D, E, K>;
}
