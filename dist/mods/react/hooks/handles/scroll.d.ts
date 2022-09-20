import { Fetcher } from "../../../types/fetcher";
import { Params } from "../../../types/params";
import { Scroller } from "../../../types/scroller";
import { State } from "../../../types/state";
import { Handle } from "./handle";
/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any, N extends D = D, K = any> extends Handle<D[], E, N[], K> {
    /**
     * Fetch the next page
     */
    scroll(): Promise<State<D[], E, N[], K> | undefined>;
}
/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Scrolling handle
 */
export declare function useScroll<D = any, E = any, N extends D = D, K = any>(scroller: Scroller<D, E, N, K>, fetcher: Fetcher<D, E, N, K> | undefined, params?: Params<D[], E, N[], K>): ScrollHandle<D, E, N, K>;
