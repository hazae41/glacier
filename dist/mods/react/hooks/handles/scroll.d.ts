import { Fetcher } from "../../../types/fetcher";
import { Params } from "../../../types/params";
import { Scroller } from "../../../types/scroller";
import { State } from "../../../types/state";
import { Handle } from "./handle";
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
export declare function useScroll<D = any, E = any, K = any>(scroller: Scroller<D, K>, fetcher: Fetcher<D, E, K>, params?: Params<D[], E>): ScrollHandle<D, E, K>;
