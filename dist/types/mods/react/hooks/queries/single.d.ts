import { Query } from '../../types/query.js';
import { Fetcher } from '../../../types/fetcher.js';
import { Params } from '../../../types/params.js';
import { State } from '../../../types/state.js';
import { Updater, UpdaterParams } from '../../../types/updater.js';

/**
 * Handle for a single resource
 */
interface SingleQuery<D = any, E = any, K = any> extends Query<D, E, K> {
    /**
     * Optimistic update
     * @param updater Mutation function
     * @param aborter Custom AbortController
     */
    update(updater: Updater<D, E, K>, uparams?: UpdaterParams<D, E, K>, aborter?: AbortController): Promise<State<D, E, K> | undefined>;
}
/**
 * Single resource handle factory
 * @param key Key (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Single handle
 */
declare function useSingleQuery<D = any, E = any, K = any>(key: K | undefined, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D, E, K>): SingleQuery<D, E, K>;

export { SingleQuery, useSingleQuery };
