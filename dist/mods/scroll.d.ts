import { Core, Fetcher, Scroller } from "./core.js";
import { TimeParams } from "./time.js";
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
    first<D = any, E = any, K = any>(skey: string | undefined, scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, aborter?: AbortController, tparams?: TimeParams, force?: boolean): Promise<import("./index.js").State<D[], E>>;
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
    scroll<D = any, E = any, K = any>(skey: string | undefined, scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, aborter?: AbortController, tparams?: TimeParams, force?: boolean): Promise<import("./index.js").State<D[], E>>;
}
