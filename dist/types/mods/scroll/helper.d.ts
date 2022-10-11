import { Core } from '../core.js';
import { Fetcher } from '../types/fetcher.js';
import { Params } from '../types/params.js';
import { Scroller } from '../types/scroller.js';
import { State } from '../types/state.js';

declare class ScrollHelper {
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
    first<D = any, E = any, K = any>(skey: string | undefined, scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K>, aborter?: AbortController, params?: Params<D[], E, K>, force?: boolean, ignore?: boolean): Promise<State<D[], E, K> | undefined>;
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
    scroll<D = any, E = any, K = any>(skey: string | undefined, scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K>, aborter?: AbortController, params?: Params<D[], E, K>, force?: boolean, ignore?: boolean): Promise<State<D[], E, K> | undefined>;
}

export { ScrollHelper };
