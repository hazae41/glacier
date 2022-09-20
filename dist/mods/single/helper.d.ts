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
    fetch<D = any, E = any, K = any>(key: K | undefined, skey: string | undefined, current: State<D, E, K> | undefined, fetcher: Fetcher<D, E, K>, aborter?: AbortController, params?: Params<D, E, K>, force?: boolean, ignore?: boolean): Promise<State<D, E, K> | undefined>;
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
    update<D = any, E = any, K = any>(key: K | undefined, skey: string | undefined, current: State<D, E, K> | undefined, poster: Poster<D, E, K>, updater: Updater<D, E, K>, aborter?: AbortController, params?: Params<D, E, K>): Promise<State<D, E, K> | undefined>;
}
