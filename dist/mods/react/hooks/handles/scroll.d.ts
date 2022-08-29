import { Fetcher, Params, Scroller } from "mods/core.js";
import { Handle } from "mods/react/hooks/handles/handle";
import { State } from "mods/storages";
/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any, K = any> extends Handle<D[], E, K> {
    /**
     * Fetch the next page
     */
    scroll(): Promise<State<D[], E> | undefined>;
}
/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (memoized)
 * @param params Parameters (static)
 * @returns Scrolling handle
 */
export declare function useScroll<D = any, E = any, K = any>(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, current?: Params<D[], E>): ScrollHandle<D, E, K>;
