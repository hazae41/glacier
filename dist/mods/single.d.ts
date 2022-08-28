import { Core, Fetcher, Poster, Updater } from "./core.js";
import { State } from "./storages/storage.js";
import { TimeParams } from "./time.js";
export declare class Single {
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
    fetch<D = any, E = any, K = any>(key: K | undefined, skey: string | undefined, fetcher: Fetcher<D, K>, aborter?: AbortController, tparams?: TimeParams, force?: boolean): Promise<State<D, E> | undefined>;
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
    update<D = any, E = any, K = any>(key: K | undefined, skey: string | undefined, poster: Poster<D, K>, updater: Updater<D>, aborter?: AbortController, tparams?: TimeParams): Promise<State<D, E>>;
}
