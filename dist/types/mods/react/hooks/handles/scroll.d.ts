import { Handle } from '../../types/handle.js';
import { Fetcher } from '../../../types/fetcher.js';
import { Params } from '../../../types/params.js';
import { Scroller } from '../../../types/scroller.js';
import { State } from '../../../types/state.js';

/**
 * Handle for a scrolling resource
 */
interface ScrollHandle<D = any, E = any, K = any> extends Handle<D[], E, K> {
    /**
     * Fetch the next page
     */
    scroll(): Promise<State<D[], E, K> | undefined>;
}
/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Scrolling handle
 */
declare function useScroll<D = any, E = any, K = any>(scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D[], E, K>): ScrollHandle<D, E, K>;

export { ScrollHandle, useScroll };
