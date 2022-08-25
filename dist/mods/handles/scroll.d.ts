import { Fetcher, Scroller } from "../core";
import { State } from "../storage";
import { Handle } from "./generic";
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
