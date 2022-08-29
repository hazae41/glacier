import { Core, Fetcher, Params, Scroller } from "mods/core";
export declare class Scroll {
    readonly core: Core;
    constructor(core: Core);
    /**
     * Fetch first page
     * @param skey Storage key
     * @param scroller Key scroller
     * @param fetcher Resource fetcher
     * @param aborter AbortController
     * @param tparams Time parameters
     * @param force Should ignore cooldown
     * @returns The new state
     */
    first<D = any, E = any, K = any>(skey: string | undefined, scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, aborter?: AbortController, params?: Params<D[], E>, force?: boolean): Promise<import("./storages/state").State<D[], E>>;
    /**
     * Scroll to the next page
     * @param skey Storage key
     * @param scroller Key scroller
     * @param fetcher Resource fetcher
     * @param aborter AbortController
     * @param tparams Time parameters
     * @param force Should ignore cooldown
     * @returns The new state
     */
    scroll<D = any, E = any, K = any>(skey: string | undefined, scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, aborter?: AbortController, params?: Params<D[], E>, force?: boolean): Promise<import("./storages/state").State<D[], E>>;
}
