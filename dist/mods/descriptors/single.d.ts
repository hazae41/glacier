import { Core } from "../core";
import { SingleInstance } from "../instances/single";
import { Poster } from "../types/poster";
import { Params } from "../types/params";
export declare class SingleDescriptor<D = any, E = any, K = any> {
    readonly key: K | undefined;
    readonly poster: Poster<D, K>;
    readonly params: Params<D, E, K>;
    constructor(key: K | undefined, poster: Poster<D, K>, params?: Params<D, E, K>);
    create(core: Core, pparams?: Params): SingleInstance<D, E, K>;
}
