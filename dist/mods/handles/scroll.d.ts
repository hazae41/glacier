import { Fetcher, Scroller } from "../core.js";
import { State } from "../storage.js";
import { Handle } from "./generic.js";
/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any, K = any> extends Handle<D[], E, K> {
    scroll(): Promise<State<D[], E> | undefined>;
}
/**
 * Scrolling resource hook
 * @param scroller Memoized scroller
 * @param fetcher Memoized fetcher
 * @param cooldown Usually your resource TTL
 * @returns A scrolling resource handle
 */
export declare function useScroll<D = any, E = any, K = any>(scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, cooldown?: number, timeout?: number): ScrollHandle<D, E, K>;
