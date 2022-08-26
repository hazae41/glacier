import { Core, Fetcher, Scroller } from "./core.js";
export declare class Scroll {
    readonly core: Core;
    constructor(core: Core);
    /**
     *
     * @param key Key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    first<D = any, E = any, K = any>(skey: string | undefined, scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, cooldown?: number, timeout?: number, aborter?: AbortController): Promise<import("./storage.js").State<D[], E>>;
    /**
     *
     * @param key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    scroll<D = any, E = any, K = any>(skey: string | undefined, scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, cooldown?: number, timeout?: number, aborter?: AbortController): Promise<import("./storage.js").State<D[], E>>;
}
