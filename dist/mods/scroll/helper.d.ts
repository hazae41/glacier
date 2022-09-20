import { Core } from "../core";
import { Fetcher } from "../types/fetcher";
import { Params } from "../types/params";
import { Scroller } from "../types/scroller";
import { State } from "../types/state";
export declare class ScrollHelper {
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
    first<D = any, E = any, K = any>(skey: string | undefined, current: State<D[], E, K> | undefined, scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K>, aborter?: AbortController, params?: Params<D[], E, K>, force?: boolean, ignore?: boolean): Promise<State<D[], E, K> | undefined>;
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
    scroll<D = any, E = any, K = any>(skey: string | undefined, current: State<D[], E, K> | undefined, scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K>, aborter?: AbortController, params?: Params<D[], E, K>, force?: boolean, ignore?: boolean): Promise<State<D[], E, K> | undefined>;
}
