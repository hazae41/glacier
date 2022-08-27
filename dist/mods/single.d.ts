import { Core, Fetcher, Poster, Updater } from "./core.js";
import { State } from "./storage.js";
export declare class Single {
    readonly core: Core;
    constructor(core: Core);
    /**
     * Simple fetch
     * @param key
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns state
     */
    fetch<D = any, E = any, K = any>(key: K | undefined, skey: string | undefined, fetcher: Fetcher<D, K>, cooldown?: number, timeout?: number, stale?: number, aborter?: AbortController): Promise<State<D, E> | undefined>;
    /**
     * Optimistic update
     * @param key
     * @param fetcher
     * @param data optimistic data, also passed to poster
     * @throws error
     * @returns updated state
     */
    update<D = any, E = any, K = any>(key: K | undefined, skey: string | undefined, poster: Poster<D, K>, updater: Updater<D>, timeout?: number, stale?: number, aborter?: AbortController): Promise<State<D, E>>;
}
