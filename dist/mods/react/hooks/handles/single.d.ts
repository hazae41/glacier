import { Params } from "../../../types/params";
import { Poster } from "../../../types/poster";
import { State } from "../../../types/state";
import { Updater } from "../../../types/updater";
import { Handle } from "./handle";
/**
 * Handle for a single resource
 */
export interface SingleHandle<D extends N = any, E = any, N = D, K = any> extends Handle<D, E, N, K> {
    /**
     * Optimistic update
     * @param updater Mutation function
     * @param aborter Custom AbortController
     */
    update(updater: Updater<D, E, N, K>, aborter?: AbortController): Promise<State<D, E, N, K> | undefined>;
}
/**
 * Single resource handle factory
 * @param key Key (memoized)
 * @param poster Resource poster or fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Single handle
 */
export declare function useSingle<D extends N = any, E = any, N = D, K = any>(key: K | undefined, poster: Poster<D, E, N, K> | undefined, cparams?: Params<D, E, N, K>): SingleHandle<D, E, N, K>;
