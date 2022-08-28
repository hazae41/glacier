import { Fetcher, Scroller } from "../core.js";
import { State } from "../storages/storage.js";
import { TimeParams } from "../time.js";
import { Handle } from "./handle.js";
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
 * @param tparams Time parameters (constant)
 * @returns Scrolling handle
 */
export declare function useScroll<D = any, E = any, K = any>(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, tparams?: TimeParams): ScrollHandle<D, E, K>;
