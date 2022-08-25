import { Core, Fetcher, Scroller } from "./core";
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
    first<D = any, E = any>(key: string | undefined, scroller: Scroller<D>, fetcher: Fetcher<D>, cooldown?: number, aborter?: AbortController): Promise<import("./storage").State<D[], E>>;
    /**
     *
     * @param key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    scroll<D = any, E = any>(key: string | undefined, scroller: Scroller<D>, fetcher: Fetcher<D>, cooldown?: number, aborter?: AbortController): Promise<import("./storage").State<D[], E>>;
}
