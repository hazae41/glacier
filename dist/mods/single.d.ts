import { Core } from "mods/core";
import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { State } from "mods/types/state";
import { Updater } from "mods/types/updater";
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
    fetch<D = any, E = any, K = any>(key: K | undefined, skey: string | undefined, fetcher: Fetcher<D, K>, aborter?: AbortController, params?: Params<D, E>, force?: boolean): Promise<State<D, E> | undefined>;
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
    update<D = any, E = any, K = any>(key: K | undefined, skey: string | undefined, poster: Poster<D, K>, updater: Updater<D>, aborter?: AbortController, params?: Params<D, E>): Promise<State<D, E>>;
}
