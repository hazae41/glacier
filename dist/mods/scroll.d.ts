import { Fetcher } from "./core";
import { Handle } from "./hooks";
import { State } from "./storage";
export declare type Scroller<D = unknown> = (previous?: D) => string | undefined;
/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any> extends Handle<D[], E> {
    scroll(): Promise<State<D[], E> | undefined>;
}
/**
 * Scrolling resource hook
 * @param scroller Memoized scroller
 * @param fetcher Memoized fetcher
 * @param cooldown Usually your resource TTL
 * @returns A scrolling resource handle
 */
export declare function useScroll<D = any, E = any>(scroller: Scroller<D>, fetcher: Fetcher<D>, cooldown?: number): ScrollHandle<D, E>;
