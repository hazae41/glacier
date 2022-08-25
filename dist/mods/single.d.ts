import { Core, Fetcher, Poster, Updater } from "./core";
import { State } from "./storage";
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
    fetch<D = any, E = any>(key: string | undefined, fetcher: Fetcher<D>, cooldown?: number): Promise<State<D, E> | undefined>;
    /**
     * Optimistic update
     * @param key
     * @param fetcher
     * @param data optimistic data, also passed to poster
     * @throws error
     * @returns updated state
     */
    update<D = any, E = any>(key: string | undefined, poster: Poster<D>, updater: Updater<D>): Promise<State<D, E>>;
}
