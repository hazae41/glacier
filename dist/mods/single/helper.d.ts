import { Core } from "../core";
import { Fetcher } from "../types/fetcher";
import { Params } from "../types/params";
import { Poster } from "../types/poster";
import { State } from "../types/state";
import { Updater } from "../types/updater";
export declare class SingleHelper {
    readonly core: Core;
    constructor(core: Core);
    /**
     * Fetch
     * @param key Key (passed to fetcher)
     * @param skey Storage key
     * @param fetcher Resource fetcher
     * @param aborter AbortController
     * @param tparams Time parameters
     * @param force Should ignore cooldown
     * @returns The new state
     */
    fetch<D = any, E = any, N = D, K = any>(key: K | undefined, skey: string | undefined, fetcher: Fetcher<D, E, N, K>, aborter?: AbortController, params?: Params<D, E, N, K>, force?: boolean): Promise<State<D, E, N, K> | undefined>;
    /**
     * Optimistic update
     * @param key Key (:K) (passed to poster)
     * @param skey Storage key
     * @param poster Resource poster
     * @param updater Mutation function
     * @param aborter AbortController
     * @param tparams Time parameters
     * @returns The new state
     * @throws Error
     */
    update<D = any, E = any, N = D, K = any>(key: K | undefined, skey: string | undefined, poster: Poster<D, E, N, K>, updater: Updater<D, E, N, K>, aborter?: AbortController, params?: Params<D, E, N, K>): Promise<State<D, E, N, K> | undefined>;
}
